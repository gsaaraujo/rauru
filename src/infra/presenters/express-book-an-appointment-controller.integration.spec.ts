import request from 'supertest';
import { describe, expect, it } from 'vitest';

describe('express-book-an-appointment', () => {
  it('should book an appointment', async () => {
    const sut = await request('http://localhost:3000').post('/book-an-appointment').send({
      price: 24,
      time: '10:15',
      date: '10/08/2100',
      doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
      patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
      creditCardToken: 'eeb87147d50342938',
    });

    expect(sut.status).toBe(204);
    expect(sut.body).toStrictEqual({});
  });
});
