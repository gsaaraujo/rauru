import { Entity } from '@shared/helpers/entity';
import { Either, right } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

export type AppointmentProps = {
  doctorId: string;
  patientId: string;
  date: Date;
};

export class Appointment extends Entity<AppointmentProps> {
  public static create(props: AppointmentProps): Either<BaseError, Appointment> {
    const appointment = new Appointment(props);
    return right(appointment);
  }

  public static reconstitute(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  get doctorId(): string {
    return this._props.doctorId;
  }

  get patientId(): string {
    return this._props.patientId;
  }

  get date(): Date {
    return this._props.date;
  }
}
