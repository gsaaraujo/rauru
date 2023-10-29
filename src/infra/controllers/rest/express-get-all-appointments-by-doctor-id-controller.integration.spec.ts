import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('express-get-all-appointments-by-doctor-id-controller', () => {
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    prismaClient = new PrismaClient();
  });

  beforeEach(async () => {
    await prismaClient.$transaction([prismaClient.schedule.deleteMany(), prismaClient.appointment.deleteMany()]);
  });

  it('should get all appointments by doctor id', async () => {
    await prismaClient.$transaction([
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
      prismaClient.appointment.create({
        data: {
          id: '667c7aa3-1929-4fb3-a1ae-0535d42396de',
          doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
          patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
          status: 'PENDING',
          price: 120,
          date: new Date('2100-10-15T00:00:00.000Z'),
        },
      }),
    ]);

    const sut = await request('http://localhost:3000').get(
      '/doctors/6bf34422-622c-4c58-a751-4614980fce03/appointments',
    );

    expect(sut.status).toBe(200);
    expect(sut.body).toStrictEqual([
      {
        id: 'be7b459c-b7e9-4a6a-8077-a2de3d2c8463',
        doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
        patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
        date: '2100-08-10T10:15:00.000Z',
        price: 120.0,
        status: 'PENDING',
      },
      {
        id: '667c7aa3-1929-4fb3-a1ae-0535d42396de',
        doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
        patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
        date: '2100-10-15T00:00:00.000Z',
        price: 120.0,
        status: 'PENDING',
      },
    ]);
  });

  it('should fail if any property has wrong type', async () => {
    const sut = await request('http://localhost:3000').get('/get-all-appointments-by-doctor-id/hie').send({});

    expect(sut.status).toBe(400);
    expect(sut.body).toStrictEqual({ errors: ['doctorId must be uuid'] });
  });

  it('should fail if no doctor was found with the provided doctor id', async () => {
    const sut = await request('http://localhost:3000')
      .get('/doctors/6bf34422-622c-4c58-a751-4614980fce03/appointments')
      .send({});

    expect(sut.status).toBe(404);
    expect(sut.body).toStrictEqual({ error: 'No doctor was found.' });
  });
});
