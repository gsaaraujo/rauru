import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { DateTime } from '@domain/models/date-time';
import { Schedule } from '@domain/models/schedule/schedule';
import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';

describe('schedule', () => {
  it('should create Schedule', () => {
    const output: Schedule = Schedule.reconstitute('any', {
      doctorId: 'any',
      timeSlots: [
        TimeSlot.reconstitute({
          dateTime: DateTime.reconstitute({ date: '18/08/2100', time: '08:00' }),
          status: TimeSlotStatus.AVAILABLE,
        }),
      ],
    });

    const sut: Either<BaseError, Schedule> = Schedule.create({
      doctorId: 'any',
      timeSlots: [
        TimeSlot.create({
          dateTime: DateTime.reconstitute({ date: '18/08/2100', time: '08:00' }),
        }).value as TimeSlot,
      ],
    });

    expect(sut.isRight()).toBeTruthy();
    expect((sut.value as Schedule).doctorId).toStrictEqual(output.doctorId);
    expect((sut.value as Schedule).timeSlots).toStrictEqual(output.timeSlots);
  });
});
