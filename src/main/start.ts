import amqplib from 'amqplib';
import { PrismaClient } from '@prisma/client';
import express, { Router, Request, Response } from 'express';

import { BookAnAppointmentService } from '@application/services/book-an-appointment-service';
import { ConfirmAnAppointmentService } from '@application/services/confirm-an-appointment-service';
import { GetAllAppointmentsByDoctorIdService } from '@application/services/get-all-appointments-by-doctor-id-service';

import { AxiosHttpAdapter } from '@infra/adapters/http/axios-http-adapter';
import { HttpDoctorGateway } from '@infra/gateways/doctor/http-doctor-gateway';
import { HttpPatientGateway } from '@infra/gateways/patient/http-patient-gateway';
import { HttpPaymentGateway } from '@infra/gateways/payment/http-payment-gateway';
import { RabbitMQqueueAdapter } from '@infra/adapters/queue/rabbitmq-queue-adapter';
import { PrismaAppointmentGateway } from '@infra/gateways/appointment/prisma-appointment-gateway';
import { PrismaScheduleRepository } from '@infra/repositories/schedule/prisma-schedule-repository';
import { PrismaAppointmentRepository } from '@infra/repositories/appointment/prisma-appointment-repository';
import { RabbitmqConfirmAnAppointmentController } from '@infra/controllers/queue/rabbitmq-confirm-an-appointment';
import { ExpressBookAnAppointmentController } from '@infra/controllers/rest/express-book-an-appointment-controller';
import { ExpressGetAllAppointmentsByDoctorIdController } from '@infra/controllers/rest/express-get-all-appointments-by-doctor-id-controller';
import { ExpressGetOneAppointmentByIdController } from '@infra/controllers/rest/express-get-one-appointment-by-id-controller';
import { GetOneAppointmentByIdService } from '@application/services/get-one-appointment-by-id-service';
import { DoesAppointmentExistByIdService } from '@application/services/does-appointment-exist-by-id-service';
import { ExpressDoesAppointmentExistByIdController } from '@infra/controllers/rest/express-does-appointment-exists-by-id-controller';

const start = async () => {
  const app = express();
  const router = Router();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const prismaClient = new PrismaClient();
  const connection = await amqplib.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();

  const axiosHttpAdapter = new AxiosHttpAdapter();
  const rabbitMQqueueAdapter = new RabbitMQqueueAdapter(channel);

  const appointmentRepository = new PrismaAppointmentRepository(prismaClient);
  const prismaScheduleRepository = new PrismaScheduleRepository(prismaClient);
  const prismaAppointmentRepository = new PrismaAppointmentRepository(prismaClient);

  const httpDoctorGateway = new HttpDoctorGateway(axiosHttpAdapter);
  const httpPatientGateway = new HttpPatientGateway(axiosHttpAdapter);
  const httpPaymentGateway = new HttpPaymentGateway(axiosHttpAdapter);
  const prismaAppointmentGateway = new PrismaAppointmentGateway(prismaClient);

  const confirmAnAppointmentService = new ConfirmAnAppointmentService(appointmentRepository, rabbitMQqueueAdapter);
  const getOneAppointmentByIdService = new GetOneAppointmentByIdService(prismaAppointmentGateway);
  const doesAppointmentExistByIdService = new DoesAppointmentExistByIdService(prismaAppointmentGateway);
  const getAllAppointmentsByDoctorIdService = new GetAllAppointmentsByDoctorIdService(
    prismaAppointmentGateway,
    httpPatientGateway,
  );
  const bookAnAppointmentService = new BookAnAppointmentService(
    prismaScheduleRepository,
    prismaAppointmentRepository,
    httpDoctorGateway,
    httpPatientGateway,
    rabbitMQqueueAdapter,
  );

  const expressBookAnAppointmentController = new ExpressBookAnAppointmentController(bookAnAppointmentService);
  const expressGetOneAppointmentByIdController = new ExpressGetOneAppointmentByIdController(
    getOneAppointmentByIdService,
  );
  const expressDoesAppointmentExistByIdController = new ExpressDoesAppointmentExistByIdController(
    doesAppointmentExistByIdService,
  );
  const expressGetAllAppointmentsByDoctorIdController = new ExpressGetAllAppointmentsByDoctorIdController(
    getAllAppointmentsByDoctorIdService,
  );
  const rabbitmqConfirmAnAppointmentController = new RabbitmqConfirmAnAppointmentController(
    confirmAnAppointmentService,
    httpPaymentGateway,
    rabbitMQqueueAdapter,
  );

  await rabbitmqConfirmAnAppointmentController.handle();

  router.post('/appointments', async (request: Request, response: Response) => {
    return expressBookAnAppointmentController.handle(request, response);
  });

  router.get('/doctors/:id/appointments', (request: Request, response: Response) => {
    return expressGetAllAppointmentsByDoctorIdController.handle(request, response);
  });

  router.get('/appointments/:id', (request: Request, response: Response) => {
    return expressGetOneAppointmentByIdController.handle(request, response);
  });

  router.get('/appointments/:id/exists', (request: Request, response: Response) => {
    return expressDoesAppointmentExistByIdController.handle(request, response);
  });

  app.use(router);

  app.listen(process.env.API_BASE_PORT, () => {
    console.log(`Listening on port ${process.env.API_BASE_PORT}`);
  });
};

start();
