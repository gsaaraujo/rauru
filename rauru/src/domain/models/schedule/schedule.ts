import { Entity } from '@shared/helpers/entity';
import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';
import { Either, left, right } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';
import { TimeSlotNotFoundError } from '@domain/errors/time-slot-not-found-error';

export type ScheduleProps = {
  doctorId: string;
  timeSlots: TimeSlot[];
};

export class Schedule extends Entity<ScheduleProps> {
  public static create(props: ScheduleProps): Schedule {
    return new Schedule(props);
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
}
