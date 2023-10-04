import {
  PrismaClient,
  Appointment as PrismaAppointment,
  AppointmentStatus as PrismaAppointmentStatus,
} from '@prisma/client';
import amqplib from 'amqplib';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe(
  'rabbitmq-confirm-an-appointment',
  () => {
    let prismaClient: PrismaClient;

    beforeEach(async () => {
      await prismaClient.$transaction([prismaClient.doctor.deleteMany(), prismaClient.patient.deleteMany()]);
    });

    afterAll(async () => {
      await prismaClient.$transaction([prismaClient.doctor.deleteMany(), prismaClient.patient.deleteMany()]);
    });

    beforeAll(async () => {
      prismaClient = new PrismaClient();
      await prismaClient.$transaction([prismaClient.doctor.deleteMany(), prismaClient.patient.deleteMany()]);
    });

    it('should confirm an appointment', async () => {
      await prismaClient.$transaction([
        prismaClient.doctor.create({
          data: { id: '6bf34422-622c-4c58-a751-4614980fce03' },
        }),
        prismaClient.patient.create({
          data: { id: 'b957aa4b-654e-47b0-a935-0923877d57a7' },
        }),
        prismaClient.schedule.create({
          data: {
            id: '821339f9-49de-4714-9fa4-db72dcb29eb5',
            doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
            price: 120,
            timeSlots: ['13:15'],
            daysOfAvailability: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          },
        }),
        prismaClient.appointment.create({
          data: {
            id: 'be7b459c-b7e9-4a6a-8077-a2de3d2c8463',
            doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
            patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
            status: 'PENDING',
            price: 120,
            date: new Date('2100-08-10T10:15:00.000Z'),
          },
        }),
        prismaClient.tokenizedPayment.create({
          data: {
            id: '4fc4a9ed-87bc-4874-b91a-1e3c6434fc61',
            creditCardToken: 'e1a77e723e544f09a7b91c5288a3bb1a',
            patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
          },
        }),
      ]);

      const connection = await amqplib.connect('amqp://localhost:5672');
      const channel = await connection.createChannel();
      await channel.assertQueue('PaymentApproved');
      channel.sendToQueue(
        'PaymentApproved',
        Buffer.from(JSON.stringify({ appointmentId: 'be7b459c-b7e9-4a6a-8077-a2de3d2c8463' })),
      );

      await new Promise((value) => setTimeout(value, 1000));

      const sut: PrismaAppointment | null = await prismaClient.appointment.findFirst({
        where: { id: 'be7b459c-b7e9-4a6a-8077-a2de3d2c8463' },
      });

      expect(sut?.status).toBe(PrismaAppointmentStatus.CONFIRMED);
    });
  },
  { timeout: 10000 },
);
