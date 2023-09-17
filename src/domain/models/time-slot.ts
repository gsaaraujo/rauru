import { BaseError } from '@shared/helpers/base-error';
import { ValueObject } from '@shared/helpers/value-object';
import { Either, left, right } from '@shared/helpers/either';

import { DateTime } from '@domain/models/date-time';
import { TimeSlotCannotBeInThePastError } from '@domain/errors/time-slot-cannot-be-in-the-past-error';

export enum TimeSlotStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export type TimeSlotProps = {
  dateTime: DateTime;
  status: TimeSlotStatus;
};

export class TimeSlot extends ValueObject<TimeSlotProps> {
  static create(props: Omit<TimeSlotProps, 'status'>): Either<BaseError, TimeSlot> {
    const currentDate = new Date();

    if (props.dateTime.dateTime.getTime() < currentDate.getTime()) {
      const error = new TimeSlotCannotBeInThePastError('The time slot cannot be in the past.');
      return left(error);
    }

    const timeSlot = new TimeSlot({ ...props, status: TimeSlotStatus.AVAILABLE });
    return right(timeSlot);
  }

  static reconstitute(props: TimeSlotProps): TimeSlot {
    return new TimeSlot(props);
  }

  get dateTime(): DateTime {
    return this.props.dateTime;
  }

  get status(): TimeSlotStatus {
    return this.props.status;
  }
}
