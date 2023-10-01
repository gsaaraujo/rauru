import { Entity } from '@shared/helpers/entity';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Money } from '@domain/models/money';
import { AppointmentCannotBeInThePastError } from '@domain/errors/appointment-cannot-be-in-the-past-error';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
}

export type AppointmentProps = {
  doctorId: string;
  patientId: string;
  date: Date;
  price: Money;
  creditCardToken: string;
  status: AppointmentStatus;
};

export class Appointment extends Entity<AppointmentProps> {
  public confirmAppointment() {
    this._props.status = AppointmentStatus.CONFIRMED;
  }

  public static create(props: Omit<AppointmentProps, 'status'>): Either<BaseError, Appointment> {
    const dateNow = new Date();

    if (props.date.getTime() < dateNow.getTime()) {
      const error = new AppointmentCannotBeInThePastError('The appointment cannot be booked in the past.');
      return left(error);
    }

    const appointment = new Appointment({
      ...props,
      status: AppointmentStatus.PENDING,
    });
    return right(appointment);
  }

  public static reconstitute(id: string, props: AppointmentProps): Appointment {
    return new Appointment(props, id);
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

  get status(): AppointmentStatus {
    return this._props.status;
  }
}
