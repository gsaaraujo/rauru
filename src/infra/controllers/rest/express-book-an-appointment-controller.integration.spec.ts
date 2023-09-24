import request from 'supertest';
import { describe, expect, it } from 'vitest';

describe('express-book-an-appointment', () => {
  it('should book an appointment', async () => {
    const sut = await request('http://localhost:3000').post('/book-an-appointment').send({
      doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
      patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
      price: 24,
      time: '10:15',
      date: '10/08/2100',
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
        'time is required',
        'creditCardToken is required',
      ],
    });
  });

  it('should fail if any property is empty', async () => {
    const sut = await request('http://localhost:3000').post('/book-an-appointment').send({
      doctorId: '',
      patientId: ' ',
      price: 24,
      time: '',
      date: ' ',
      creditCardToken: '',
    });

    expect(sut.status).toBe(400);
    expect(sut.body).toStrictEqual({
      errors: [
        'doctorId must be uuid',
        'patientId must be uuid',
        "date must be 'dd/mm/aaaa' format",
        "time must be 'hh:mm' (24h) format",
        'creditCardToken cannot be empty',
      ],
    });
  });

  it('should fail if any property has wrong type', async () => {
    const sut = await request('http://localhost:3000').post('/book-an-appointment').send({
      doctorId: 1,
      patientId: undefined,
      price: '24',
      time: 3,
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
        'time must be string',
        'creditCardToken must be string',
      ],
    });
  });

  it('should fail if any property has a invalid format', async () => {
    const sut = await request('http://localhost:3000').post('/book-an-appointment').send({
      time: 'hie',
      date: 'hie',
    });

    expect(sut.status).toBe(400);
    expect(sut.body).toStrictEqual({
      errors: [
        'doctorId is required',
        'patientId is required',
        'price is required',
        "date must be 'dd/mm/aaaa' format",
        "time must be 'hh:mm' (24h) format",
        'creditCardToken is required',
      ],
    });
  });
});
