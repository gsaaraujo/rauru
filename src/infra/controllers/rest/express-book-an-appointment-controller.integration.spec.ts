import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('express-book-an-appointment', () => {
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    prismaClient = new PrismaClient();
    await prismaClient.$transaction([prismaClient.doctor.deleteMany(), prismaClient.patient.deleteMany()]);
  });

  beforeEach(async () => {
    await prismaClient.$transaction([prismaClient.doctor.deleteMany(), prismaClient.patient.deleteMany()]);
  });

  afterAll(async () => {
    await prismaClient.$transaction([prismaClient.doctor.deleteMany(), prismaClient.patient.deleteMany()]);
  });

  it('should book an appointment', async () => {
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
          price: 24,
          timeSlots: ['13:15'],
          daysOfAvailability: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        },
      }),
    ]);

    const sut = await request('http://localhost:3000')
      .post('/book-an-appointment')
      .send({
        doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
        patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
        price: 24,
        date: new Date('2100-08-10T13:15:00.000Z'),
        creditCardToken: 'eeb87147d50342938',
      });

    expect(sut.status).toBe(204);
    expect(sut.body).toStrictEqual({});
  });

  it('should fail if any property is missing', async () => {
    const sut = await request('http://localhost:3000').post('/book-an-appointment').send({});

    expect(sut.status).toBe(400);
    expect(sut.body).toStrictEqual({
      errors: [
        'doctorId is required',
        'patientId is required',
        'price is required',
        'date is required',
        'creditCardToken is required',
      ],
    });
  });

  it('should fail if any property is empty', async () => {
    const sut = await request('http://localhost:3000').post('/book-an-appointment').send({
      doctorId: '',
      patientId: ' ',
      price: 24,
      date: ' ',
      creditCardToken: '',
    });

    expect(sut.status).toBe(400);
    expect(sut.body).toStrictEqual({
      errors: [
        'doctorId must be uuid',
        'patientId must be uuid',
        'date cannot be empty',
        'creditCardToken cannot be empty',
      ],
    });
  });

  it('should fail if any property has wrong type', async () => {
    const sut = await request('http://localhost:3000').post('/book-an-appointment').send({
      doctorId: 1,
      patientId: undefined,
      price: '24',
      date: 4,
      creditCardToken: 5,
    });

    expect(sut.status).toBe(400);
    expect(sut.body).toStrictEqual({
      errors: [
        'doctorId must be string',
        'patientId is required',
        'price must be number',
        'date must be string',
        'creditCardToken must be string',
      ],
    });
  });
});
