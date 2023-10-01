import { Entity } from '@shared/helpers/entity';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Money } from '@domain/models/money';
import { TimeSlotNotFoundError } from '@domain/errors/time-slot-not-found-error';
import { TimeSlotAlreadyAddedError } from '@domain/errors/time-slot-already-added-error';
import { DaysOfAvailabilityNotFoundError } from '@domain/errors/days-of-availability-not-found-error';
import { DayOfAvailabilityAlreadyAddedError } from '@domain/errors/day-of-availability-already-added-error';

export enum DaysOfAvailability {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export type ScheduleProps = {
  doctorId: string;
  price: Money;
  timeSlots: string[];
  daysOfAvailability: DaysOfAvailability[];
};

export class Schedule extends Entity<ScheduleProps> {
  public static create(props: Omit<ScheduleProps, 'timeSlots' | 'daysOfAvailability'>): Either<BaseError, Schedule> {
    const schedule = new Schedule({ ...props, timeSlots: [], daysOfAvailability: [] });
    return right(schedule);
  }

  public static reconstitute(id: string, props: ScheduleProps): Schedule {
    return new Schedule(props, id);
  }

  public hasTimeSlot(date: Date): boolean {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    const dayOfTheWeek = {
      [0]: DaysOfAvailability.SUNDAY,
      [1]: DaysOfAvailability.MONDAY,
      [2]: DaysOfAvailability.TUESDAY,
      [3]: DaysOfAvailability.WEDNESDAY,
      [4]: DaysOfAvailability.THURSDAY,
      [5]: DaysOfAvailability.FRIDAY,
      [6]: DaysOfAvailability.SATURDAY,
    };

    const dayOfAvailability: DaysOfAvailability | undefined = this._props.daysOfAvailability.find(
      (dayOfAvailability) => dayOfAvailability === dayOfTheWeek[date.getDay() as keyof typeof dayOfTheWeek],
    );

    if (!dayOfAvailability) return false;

    for (const timeSlot of this._props.timeSlots) {
      const [timeSlotHour, timeSlotMinutes] = timeSlot.split(':');
      if (Number(timeSlotHour) === hours && Number(timeSlotMinutes) === minutes) {
        return true;
      }
    }

    return false;
  }

  public addTimeSlot(newTimeSlot: string): Either<BaseError, void> {
    const timeFound = this._props.timeSlots.find((timeSlot) => timeSlot === newTimeSlot);

    if (timeFound) {
      const error = new TimeSlotAlreadyAddedError('This time slot has already been added.');
      return left(error);
    }

    this._props.timeSlots.push(newTimeSlot);
    return right(undefined);
  }

  public removeTimeSlot(inputTimeSlot: string): Either<BaseError, void> {
    const timeFound = this._props.timeSlots.find((timeSlot) => timeSlot === inputTimeSlot);

    if (!timeFound) {
      const error = new TimeSlotNotFoundError('The doctor has not defined a time slot for this date.');
      return left(error);
    }

    this._props.timeSlots = this._props.timeSlots.filter((timeSlot) => timeSlot !== inputTimeSlot);
    return right(undefined);
  }

  public addDayOfAvailability(newDayOfAvailability: DaysOfAvailability): Either<BaseError, void> {
    const dayOfAvailabilityFound: DaysOfAvailability | undefined = this._props.daysOfAvailability.find(
      (dayOfAvailability) => dayOfAvailability === newDayOfAvailability,
    );

    if (dayOfAvailabilityFound) {
      const error = new DayOfAvailabilityAlreadyAddedError('This day has already been added.');
      return left(error);
    }

    this._props.daysOfAvailability.push(newDayOfAvailability);
    return right(undefined);
  }

  public removeDayOfAvailability(dayOfAvailability: DaysOfAvailability): Either<BaseError, void> {
    const dayOfAvailabilityFound: DaysOfAvailability | undefined = this._props.daysOfAvailability.find(
      (day) => day === dayOfAvailability,
    );

    if (!dayOfAvailabilityFound) {
      const error = new DaysOfAvailabilityNotFoundError('The doctor has not added this day as available.');
      return left(error);
    }

    this._props.daysOfAvailability = this._props.daysOfAvailability.filter((day) => day !== dayOfAvailability);
    return right(undefined);
  }

  get doctorId(): string {
    return this._props.doctorId;
  }

  get timeSlots(): string[] {
    return this._props.timeSlots;
  }

  get price(): Money {
    return this._props.price;
  }

  get daysOfAvailability(): DaysOfAvailability[] {
    return this._props.daysOfAvailability;
  }
}
