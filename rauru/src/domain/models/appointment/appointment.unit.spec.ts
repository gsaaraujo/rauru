import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Appointment } from '@domain/models/appointment/appointment';

describe('appointment', () => {
  it('should create Appointment', () => {
    const output: Appointment = Appointment.reconstitute({
      doctorId: 'any',
      patientId: 'any',
      date: new Date('2020-08-18T08:00:00Z'),
    });

    const sut: Either<BaseError, Appointment> = Appointment.create({
      doctorId: 'any',
      patientId: 'any',
      date: new Date('2020-08-18T08:00:00Z'),
    });

    expect(sut.isRight()).toBeTruthy();
    expect((sut.value as Appointment).doctorId).toBe(output.doctorId);
    expect((sut.value as Appointment).patientId).toBe(output.patientId);
    expect((sut.value as Appointment).date).toStrictEqual(output.date);
  });
});
