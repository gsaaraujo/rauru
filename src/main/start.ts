import express from 'express';
import amqplib from 'amqplib';
import { PrismaClient } from '@prisma/client';

import { router } from '@main/routes';

import { ConfirmAnAppointment } from '@domain/usecases/confirm-an-appointment';

import { RabbitMQqueueAdapter } from '@infra/adapters/queue/rabbitmq-queue-adapter';
import { PrismaAppointmentRepository } from '@infra/repositories/appointment/prisma-appointment-repository';
import { RabbitmqConfirmAnAppointmentController } from '@infra/controllers/queue/rabbitmq-confirm-an-appointment';

const start = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(router);

  const prismaClient = new PrismaClient();
  const connection = await amqplib.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();

  const rabbitMQqueueAdapter = new RabbitMQqueueAdapter(channel);
  const appointmentRepository = new PrismaAppointmentRepository(prismaClient);
  const confirmAnAppointment = new ConfirmAnAppointment(appointmentRepository, rabbitMQqueueAdapter);
  const rabbitmqConfirmAnAppointmentController = new RabbitmqConfirmAnAppointmentController(
    confirmAnAppointment,
    rabbitMQqueueAdapter,
  );

  rabbitmqConfirmAnAppointmentController.handle();

  app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
  });
};

start();
