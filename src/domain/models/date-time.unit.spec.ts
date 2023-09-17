import { describe, expect, it } from 'vitest';

import { DateTime } from '@domain/models/date-time';

describe('date-time', () => {
  it('should return DateTime', () => {
    const sut = DateTime.create({ date: '17/09/2023', time: '10:00' });

    expect(sut.isRight()).toBe(true);
    expect((sut.value as DateTime).dateTime).toStrictEqual(new Date('2023-09-17T13:00:00.000Z'));
  });
});
