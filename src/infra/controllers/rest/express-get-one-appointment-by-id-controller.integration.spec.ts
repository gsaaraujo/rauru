import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('express-get-one-appointment-by-id-controller', () => {
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    prismaClient = new PrismaClient();
  });

  beforeEach(async () => {
    await prismaClient.$transaction([prismaClient.appointment.deleteMany()]);
  });

  it('should succeed and return one appointment', async () => {
    await prismaClient.$transaction([
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

    const sut = await request('http://localhost:3000').get('/appointments/667c7aa3-1929-4fb3-a1ae-0535d42396de');

    expect(sut.status).toBe(200);
    expect(sut.body).toStrictEqual({
      id: '667c7aa3-1929-4fb3-a1ae-0535d42396de',
      doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
      patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
      status: 'PENDING',
      price: 120,
      date: '2100-10-15T00:00:00.000Z',
    });
  });

  it('should fail and return an error', async () => {
    const sut = await request('http://localhost:3000').get('/appointments/667c7aa3-1929-4fb3-a1ae-0535d42396de');

    expect(sut.status).toBe(404);
    expect(sut.body).toStrictEqual({ error: 'Appointment not found.' });
  });
});
