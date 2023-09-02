import { ValueObject } from '@shared/helpers/value-object';

export enum TimeSlotStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export type TimeSlotProps = {
  date: Date;
  status: TimeSlotStatus;
};

export class TimeSlot extends ValueObject<TimeSlotProps> {
  static create(props: Omit<TimeSlotProps, 'status'>): TimeSlot {
    return new TimeSlot({ date: props.date, status: TimeSlotStatus.AVAILABLE });
  }

  static reconstitute(props: TimeSlotProps): TimeSlot {
    return new TimeSlot(props);
  }

  get date(): Date {
    return this.props.date;
  }

  get status(): TimeSlotStatus {
    return this.props.status;
  }
}
