import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';
import { TimeSlotCannotBeInThePastError } from '@domain/errors/time-slot-cannot-be-in-the-past-error';

describe('time-slot', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('should create timeSlot', () => {
    const currentDate = new Date('2023-08-20T10:00:00Z');
    vi.setSystemTime(currentDate);
    const output: TimeSlot = TimeSlot.reconstitute({
      date: new Date('2023-08-20T14:00:00Z'),
      status: TimeSlotStatus.AVAILABLE,
    });

    const sut: Either<BaseError, TimeSlot> = TimeSlot.create({
      date: new Date('2023-08-20T14:00:00Z'),
    });

    expect(sut.isRight()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if the provided date is less than the current date', () => {
    const currentDate = new Date('2023-08-20T14:00:00Z');
    vi.setSystemTime(currentDate);
    const output = new TimeSlotCannotBeInThePastError('The time slot cannot be in the past.');

    const sut: Either<BaseError, TimeSlot> = TimeSlot.create({
      date: new Date('2023-08-18T08:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
