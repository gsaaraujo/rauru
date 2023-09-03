import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentCannotBeInThePastError } from '@domain/errors/appointment-cannot-be-in-the-past-error';

describe('appointment', () => {
  it('should create Appointment', () => {
    const output: Appointment = Appointment.reconstitute({
      doctorId: 'any',
      patientId: 'any',
      date: new Date('2100-08-18T08:00:00Z'),
    });

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: 'any',
      patientId: 'any',
      date: new Date('2100-08-18T08:00:00Z'),
    });

    expect(sut.isRight()).toBeTruthy();
    expect((sut.value as Appointment).doctorId).toBe(output.doctorId);
    expect((sut.value as Appointment).patientId).toBe(output.patientId);
    expect((sut.value as Appointment).date).toStrictEqual(output.date);
  });

  it('should fail if date is less than current date', () => {
    const output = new AppointmentCannotBeInThePastError('Cannot book an appointment in the past.');

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: 'any',
      patientId: 'any',
      date: new Date('2020-08-18T08:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
