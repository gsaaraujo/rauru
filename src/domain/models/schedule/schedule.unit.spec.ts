import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Schedule } from '@domain/models/schedule/schedule';
import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';
import { InvalidPropertyError } from '@domain/errors/invalid-property-error';

describe('schedule', () => {
  it('should create Schedule', () => {
    const output: Schedule = Schedule.reconstitute('any', {
      doctorId: 'any',
      timeSlots: [
        TimeSlot.reconstitute({
          date: new Date('2100-08-20T14:00:00Z'),
          status: TimeSlotStatus.AVAILABLE,
        }),
      ],
    });

    const sut: Either<BaseError, Schedule> = Schedule.create({
      doctorId: 'any',
      timeSlots: [
        TimeSlot.create({
          date: new Date('2100-08-20T14:00:00Z'),
        }).value as TimeSlot,
      ],
    });

    expect(sut.isRight()).toBeTruthy();
    expect((sut.value as Schedule).doctorId).toStrictEqual(output.doctorId);
    expect((sut.value as Schedule).timeSlots).toStrictEqual(output.timeSlots);
  });

  it('should fail if doctorId is not String', () => {
    const output: BaseError = new InvalidPropertyError('DoctorId must be String and non-empty');

    const sut: Either<BaseError, Schedule> = Schedule.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doctorId: 3 as any,
      timeSlots: [
        TimeSlot.create({
          date: new Date('2100-08-20T14:00:00Z'),
        }).value as TimeSlot,
      ],
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if doctorId is empty', () => {
    const output: BaseError = new InvalidPropertyError('DoctorId must be String and non-empty');

    const sut: Either<BaseError, Schedule> = Schedule.create({
      doctorId: ' ',
      timeSlots: [
        TimeSlot.create({
          date: new Date('2100-08-20T14:00:00Z'),
        }).value as TimeSlot,
      ],
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
