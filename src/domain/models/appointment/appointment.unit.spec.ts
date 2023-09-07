import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Money } from '@domain/models/money';
import { Appointment, AppointmentStatus } from '@domain/models/appointment/appointment';
import { InvalidPropertyError } from '@domain/errors/invalid-property-error';
import { AppointmentCannotBeInThePastError } from '@domain/errors/appointment-cannot-be-in-the-past-error';

describe('appointment', () => {
  it('should create Appointment', () => {
    const output: Appointment = Appointment.reconstitute('any', {
      doctorId: 'any',
      patientId: 'any',
      status: AppointmentStatus.PENDING,
      price: Money.reconstitute({ amount: 0 }),
      creditCardToken: 'any',
      date: new Date('2100-08-18T08:00:00Z'),
    });

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: 'any',
      patientId: 'any',
      price: Money.create({ amount: 0 }).value as Money,
      creditCardToken: 'any',
      date: new Date('2100-08-18T08:00:00Z'),
    });

    expect(sut.isRight()).toBeTruthy();
    expect((sut.value as Appointment).doctorId).toBe(output.doctorId);
    expect((sut.value as Appointment).patientId).toBe(output.patientId);
    expect((sut.value as Appointment).price).toStrictEqual(output.price);
    expect((sut.value as Appointment).creditCardToken).toBe(output.creditCardToken);
    expect((sut.value as Appointment).date).toStrictEqual(output.date);
  });

  it('should fail if date is less than current date', () => {
    const output = new AppointmentCannotBeInThePastError('Cannot book an appointment in the past.');

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: 'any',
      patientId: 'any',
      price: Money.create({ amount: 0 }).value as Money,
      creditCardToken: 'any',
      date: new Date('2020-08-18T08:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if doctorId is not String', () => {
    const output = new InvalidPropertyError('DoctorId must be String and non-empty.');

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: ' ',
      patientId: 'any',
      price: Money.create({ amount: 0 }).value as Money,
      creditCardToken: 'any',
      date: new Date('2020-08-18T08:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if patientId is not String', () => {
    const output = new InvalidPropertyError('PatientId must be String and non-empty.');

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: 'any',
      patientId: ' ',
      price: Money.create({ amount: 0 }).value as Money,
      creditCardToken: 'any',
      date: new Date('2020-08-18T08:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if date is not Date', () => {
    const output = new InvalidPropertyError('Date must be Date and non-empty.');

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: 'any',
      patientId: 'any',
      price: Money.create({ amount: 0 }).value as Money,
      creditCardToken: 'any',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      date: ' ' as any,
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
