import { describe, expect, it } from 'vitest';

import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';

describe('time-slot', () => {
  it('should create timeSlot', () => {
    const output: TimeSlot = TimeSlot.reconstitute({
      date: new Date('2023-08-20T14:00:00Z'),
      status: TimeSlotStatus.AVAILABLE,
    });

    const sut: TimeSlot = TimeSlot.create({
      date: new Date('2023-08-20T14:00:00Z'),
    });

    expect(sut).toStrictEqual(output);
  });
});
