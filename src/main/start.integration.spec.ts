import request from 'supertest';
import { describe, expect, it } from 'vitest';

describe('start', () => {
  it('should connect to api successfully', async () => {
    const sut = await request('http://localhost:3000').get('/');

    expect(sut.status).toBe(200);
    expect(sut.body).toStrictEqual({});
  });
});
