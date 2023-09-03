import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';
import { InvalidPropertyError } from '@domain/errors/invalid-property-error';
import { TimeSlotCannotBeInThePastError } from '@domain/errors/time-slot-cannot-be-in-the-past-error';

describe('time-slot', () => {
  it('should create timeSlot', () => {
    const output: TimeSlot = TimeSlot.reconstitute({
      date: new Date('2100-08-20T14:00:00Z'),
      status: TimeSlotStatus.AVAILABLE,
    });

    const sut: Either<BaseError, TimeSlot> = TimeSlot.create({
      date: new Date('2100-08-20T14:00:00Z'),
    });

    expect(sut.isRight()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if the provided date is less than the current date', () => {
    const output = new TimeSlotCannotBeInThePastError('The time slot cannot be in the past.');

    const sut: Either<BaseError, TimeSlot> = TimeSlot.create({
      date: new Date('2020-08-18T08:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if the provided date is not Date', () => {
    const output: BaseError = new InvalidPropertyError('Date must be Date and non-empty');

    const sut: Either<BaseError, TimeSlot> = TimeSlot.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      date: ' ' as any,
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
