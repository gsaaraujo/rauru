import { Entity } from '@shared/helpers/entity';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Money } from '@domain/models/money';
import { InvalidPropertyError } from '@domain/errors/invalid-property-error';
import { AppointmentCannotBeInThePastError } from '@domain/errors/appointment-cannot-be-in-the-past-error';

export type AppointmentProps = {
  doctorId: string;
  patientId: string;
  price: Money;
  creditCardToken: string;
  date: Date;
};

export class Appointment extends Entity<AppointmentProps> {
  public static create(props: AppointmentProps): Either<BaseError, Appointment> {
    if (typeof props.doctorId !== 'string' || props.doctorId.trim() === '') {
      const error = new InvalidPropertyError('DoctorId must be String and non-empty.');
      return left(error);
    }

    if (typeof props.patientId !== 'string' || props.patientId.trim() === '') {
      const error = new InvalidPropertyError('PatientId must be String and non-empty.');
      return left(error);
    }

    if (!(props.date instanceof Date)) {
      const error = new InvalidPropertyError('Date must be Date and non-empty.');
      return left(error);
    }

    const currentDate = new Date();

    if (props.date.getTime() < currentDate.getTime()) {
      const error = new AppointmentCannotBeInThePastError('Cannot book an appointment in the past.');
      return left(error);
    }

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

  get price(): Money {
    return this._props.price;
  }

  get creditCardToken(): string {
    return this._props.creditCardToken;
  }
}
