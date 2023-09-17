import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { DateTime } from '@domain/models/date-time';
import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';
import { TimeSlotCannotBeInThePastError } from '@domain/errors/time-slot-cannot-be-in-the-past-error';

describe('time-slot', () => {
  it('should create timeSlot', () => {
    const output: TimeSlot = TimeSlot.reconstitute({
      dateTime: DateTime.reconstitute({ date: '18/08/2100', time: '08:00' }),
      status: TimeSlotStatus.AVAILABLE,
    });

    const sut: Either<BaseError, TimeSlot> = TimeSlot.create({
      dateTime: DateTime.reconstitute({ date: '18/08/2100', time: '08:00' }),
    });

    expect(sut.isRight()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if the provided date is less than the current date', () => {
    const output = new TimeSlotCannotBeInThePastError('The time slot cannot be in the past.');

    const sut: Either<BaseError, TimeSlot> = TimeSlot.create({
      dateTime: DateTime.create({ date: '18/08/2003', time: '08:00' }).value as DateTime,
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
