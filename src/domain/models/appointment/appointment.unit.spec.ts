import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Money } from '@domain/models/money';
import { DateTime } from '@domain/models/date-time';
import { Appointment, AppointmentStatus } from '@domain/models/appointment/appointment';
import { AppointmentCannotBeInThePastError } from '@domain/errors/appointment-cannot-be-in-the-past-error';

describe('appointment', () => {
  it('should create Appointment', () => {
    const output: Appointment = Appointment.reconstitute('any', {
      doctorId: 'any',
      patientId: 'any',
      status: AppointmentStatus.PENDING,
      price: Money.reconstitute({ amount: 0 }),
      creditCardToken: 'any',
      dateTime: DateTime.reconstitute({ date: '18/08/2100', time: '08:00' }),
    });

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: 'any',
      patientId: 'any',
      price: Money.create({ amount: 0 }).value as Money,
      creditCardToken: 'any',
      dateTime: DateTime.reconstitute({ date: '18/08/2100', time: '08:00' }),
    });

    expect(sut.isRight()).toBeTruthy();
    expect((sut.value as Appointment).doctorId).toBe(output.doctorId);
    expect((sut.value as Appointment).patientId).toBe(output.patientId);
    expect((sut.value as Appointment).price).toStrictEqual(output.price);
    expect((sut.value as Appointment).creditCardToken).toBe(output.creditCardToken);
  });

  it('should fail if date is less than current date', () => {
    const output = new AppointmentCannotBeInThePastError('The appointment cannot be booked in the past.');

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: 'any',
      patientId: 'any',
      price: Money.create({ amount: 0 }).value as Money,
      creditCardToken: 'any',
      dateTime: DateTime.create({ date: '18/08/2003', time: '08:00' }).value as DateTime,
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
