import { Entity } from '@shared/helpers/entity';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';
import { InvalidPropertyError } from '@domain/errors/invalid-property-error';
import { TimeSlotNotFoundError } from '@domain/errors/time-slot-not-found-error';

export type ScheduleProps = {
  doctorId: string;
  timeSlots: TimeSlot[];
};

export class Schedule extends Entity<ScheduleProps> {
  public static create(props: ScheduleProps): Either<BaseError, Schedule> {
    if (typeof props.doctorId !== 'string' || props.doctorId.trim() === '') {
      const error = new InvalidPropertyError('DoctorId must be String and non-empty');
      return left(error);
    }

    const schedule = new Schedule(props);
    return right(schedule);
  }

  public static reconstitute(props: ScheduleProps): Schedule {
    return new Schedule(props);
  }

  public isTimeSlotAvailable(date: Date): Either<BaseError, boolean> {
    const timeSlotFound: TimeSlot | undefined = this._props.timeSlots.find(
      (timeSlot) => timeSlot.date.getTime() === date.getTime(),
    );

    if (!timeSlotFound) {
      const error = new TimeSlotNotFoundError('The doctor has not defined a time slot for this date.');
      return left(error);
    }

    return right(timeSlotFound.status === TimeSlotStatus.AVAILABLE);
  }

  get doctorId(): string {
    return this._props.doctorId;
  }

  get timeSlots(): TimeSlot[] {
    return this._props.timeSlots;
  }
}
