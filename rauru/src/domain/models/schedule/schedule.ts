import { Entity } from '@shared/helpers/entity';
import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';

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

  public isTimeSlotAvailable(date: Date): boolean {
    const timeSlotFound: TimeSlot | undefined = this._props.timeSlots.find(
      (timeSlot) => timeSlot.date.getTime() === date.getTime(),
    );

    if (!timeSlotFound) return false;
    return timeSlotFound.status === TimeSlotStatus.AVAILABLE;
  }

  get doctorId(): string {
    return this._props.doctorId;
  }
}
