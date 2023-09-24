import { DoctorNotFoundError } from '@infra/errors/doctor-not-found-error';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

describe('express-get-all-appointments-by-doctor-id-controller', () => {
  it('should get all appointments by doctor id', async () => {
    const sut = await request('http://localhost:3000').get(
      '/get-all-appointments-by-doctor-id/6bf34422-622c-4c58-a751-4614980fce03',
    );

    expect(sut.status).toBe(200);
    expect(sut.body).toStrictEqual([
      {
        id: '1f30b953-279f-4b9f-9690-d22f29c3c032',
        doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
        patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
        date: '2100-08-10T13:15:00.000Z',
        price: 120.0,
        status: 'PENDING',
      },
      {
        id: '43b60b28-1750-4b5d-b7b6-56736e1ae842',
        doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
        patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
        date: '2100-08-15T16:00:00.000Z',
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
      .get('/get-all-appointments-by-doctor-id/6bf34422-622c-4c58-a751-4614980fce03')
      .send({});

    expect(sut.status).toBe(404);
    expect(sut.body).toStrictEqual({ error: 'No doctor was found.' });
  });
});
