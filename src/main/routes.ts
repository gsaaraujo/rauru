import amqplib from 'amqplib';

import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

import { BookAnAppointment } from '@domain/usecases/book-an-appointment';

import { PrismaDoctorGateway } from '@infra/gateways/doctor/prisma-doctor-gateway';
import { RabbitMQqueueAdapter } from '@infra/adapters/queue/rabbitmq-queue-adapter';
import { PrismaPatientGateway } from '@infra/gateways/patient/prisma-patient-gateway';
import { PrismaScheduleRepository } from '@infra/repositories/schedule/prisma-schedule-repository';
import { PrismaAppointmentRepository } from '@infra/repositories/appointment/prisma-appointment-repository';
import { ExpressBookAnAppointmentController } from '@infra/controllers/rest/express-book-an-appointment-controller';
import { ExpressGetAllAppointmentsByDoctorIdController } from '@infra/controllers/rest/express-get-all-appointments-by-doctor-id-controller';
import { PrismaAppointmentGateway } from '@infra/gateways/appointment/prisma-appointment-gateway';

export const router = Router();

router.get('/', (request: Request, response: Response) => {
  return response.status(200).send({});
});

router.get('/get-all-appointments-by-doctor-id/:doctorId', (request: Request, response: Response) => {
  const prisma = new PrismaClient();
  const prismaDoctorGateway = new PrismaDoctorGateway(prisma);
  const prismaAppointmentGateway = new PrismaAppointmentGateway(prisma);

  const expressGetAllAppointmentsByDoctorIdController = new ExpressGetAllAppointmentsByDoctorIdController(
    prismaAppointmentGateway,
    prismaDoctorGateway,
  );

  return expressGetAllAppointmentsByDoctorIdController.handle(request, response);
});

router.post('/book-an-appointment', async (request: Request, response: Response) => {
  const prisma = new PrismaClient();
  const connection = await amqplib.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();

  const rabbitMQqueueAdapter = new RabbitMQqueueAdapter(channel);

  const prismaScheduleRepository = new PrismaScheduleRepository(prisma);
  const prismaAppointmentRepository = new PrismaAppointmentRepository(prisma);

  const prismaDoctorGateway = new PrismaDoctorGateway(prisma);
  const prismaPatientGateway = new PrismaPatientGateway(prisma);

  const bookAnAppointment = new BookAnAppointment(
    prismaScheduleRepository,
    prismaAppointmentRepository,
    prismaDoctorGateway,
    prismaPatientGateway,
    rabbitMQqueueAdapter,
  );

  const expressBookAnAppointmentController = new ExpressBookAnAppointmentController(bookAnAppointment);

  return expressBookAnAppointmentController.handle(request, response);
});
