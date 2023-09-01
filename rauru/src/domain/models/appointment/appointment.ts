import { Entity } from '@shared/helpers/entity';

export type AppointmentProps = {};

export class Appointment extends Entity<AppointmentProps> {
  public static create(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }
}
