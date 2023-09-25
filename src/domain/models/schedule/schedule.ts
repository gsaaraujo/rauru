import { Entity } from '@shared/helpers/entity';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';
import { TimeSlotNotFoundError } from '@domain/errors/time-slot-not-found-error';

export type ScheduleProps = {
  doctorId: string;
  timeSlots: TimeSlot[];
};

export class Schedule extends Entity<ScheduleProps> {
  public static create(props: ScheduleProps): Either<BaseError, Schedule> {
    const schedule = new Schedule(props);
    return right(schedule);
  }

  public static reconstitute(id: string, props: ScheduleProps): Schedule {
    return new Schedule(props, id);
  }

  public isTimeSlotAvailable(date: string, time: string): Either<BaseError, boolean> {
    const timeSlotFound: TimeSlot | undefined = this._props.timeSlots.find(
      (timeSlot) => timeSlot.dateTime.date === date && timeSlot.dateTime.time === time,
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
