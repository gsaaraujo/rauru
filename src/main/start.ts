import amqplib from 'amqplib';
import { PrismaClient } from '@prisma/client';
import express, { Router, Request, Response } from 'express';

import { PrismaDoctorGateway } from '@infra/gateways/doctor/prisma-doctor-gateway';
import { RabbitMQqueueAdapter } from '@infra/adapters/queue/rabbitmq-queue-adapter';
import { PrismaPatientGateway } from '@infra/gateways/patient/prisma-patient-gateway';
import { PrismaAppointmentGateway } from '@infra/gateways/appointment/prisma-appointment-gateway';
import { PrismaScheduleRepository } from '@infra/repositories/schedule/prisma-schedule-repository';
import { PrismaAppointmentRepository } from '@infra/repositories/appointment/prisma-appointment-repository';
import { RabbitmqConfirmAnAppointmentController } from '@infra/controllers/queue/rabbitmq-confirm-an-appointment';
import { ExpressBookAnAppointmentController } from '@infra/controllers/rest/express-book-an-appointment-controller';

import { BookAnAppointmentService } from '@application/services/book-an-appointment-service';
import { ConfirmAnAppointmentService } from '@application/services/confirm-an-appointment-service';
import { GetAllAppointmentsByDoctorIdService } from '@application/services/get-all-appointments-by-doctor-id-service';
import { ExpressGetAllAppointmentsByDoctorIdController } from '@infra/controllers/rest/express-get-all-appointments-by-doctor-id-controller';

const start = async () => {
  const app = express();
  const router = Router();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const prismaClient = new PrismaClient();
  const connection = await amqplib.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();

  const rabbitMQqueueAdapter = new RabbitMQqueueAdapter(channel);

  const appointmentRepository = new PrismaAppointmentRepository(prismaClient);
  const prismaScheduleRepository = new PrismaScheduleRepository(prismaClient);
  const prismaAppointmentRepository = new PrismaAppointmentRepository(prismaClient);

  const prismaDoctorGateway = new PrismaDoctorGateway(prismaClient);
  const prismaPatientGateway = new PrismaPatientGateway(prismaClient);
  const prismaAppointmentGateway = new PrismaAppointmentGateway(prismaClient);

  const confirmAnAppointment = new ConfirmAnAppointmentService(appointmentRepository, rabbitMQqueueAdapter);
  const getAllAppointmentsByDoctorIdService = new GetAllAppointmentsByDoctorIdService(
    prismaAppointmentGateway,
    prismaDoctorGateway,
  );
  const bookAnAppointmentService = new BookAnAppointmentService(
    prismaScheduleRepository,
    prismaAppointmentRepository,
    prismaDoctorGateway,
    prismaPatientGateway,
    rabbitMQqueueAdapter,
  );

  const expressBookAnAppointmentController = new ExpressBookAnAppointmentController(bookAnAppointmentService);
  const expressGetAllAppointmentsByDoctorIdController = new ExpressGetAllAppointmentsByDoctorIdController(
    getAllAppointmentsByDoctorIdService,
  );
  const rabbitmqConfirmAnAppointmentController = new RabbitmqConfirmAnAppointmentController(
    confirmAnAppointment,
    rabbitMQqueueAdapter,
  );

  rabbitmqConfirmAnAppointmentController.handle();

  router.get('/get-all-appointments-by-doctor-id/:doctorId', (request: Request, response: Response) => {
    return expressGetAllAppointmentsByDoctorIdController.handle(request, response);
  });

  router.post('/book-an-appointment', async (request: Request, response: Response) => {
    return expressBookAnAppointmentController.handle(request, response);
  });

  app.use(router);

  app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
  });
};

start();
