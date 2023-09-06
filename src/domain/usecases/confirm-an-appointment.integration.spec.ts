import { beforeEach, describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { ConfirmAnAppointment } from '@domain/usecases/confirm-an-appointment';
import { AppointmentNotFoundError } from '@domain/errors/appointment-not-found-error';

import { FakeAppointmentRepository } from '@infra/repositories/appointment/fake-appointment-repository';

describe('confirm-an-appointment', () => {
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let confirmAnAppointment: ConfirmAnAppointment;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    confirmAnAppointment = new ConfirmAnAppointment(fakeAppointmentRepository);
  });

  it(`given the patient has not booked an appointment
      when pattient attempt to confirm an appointment
      then it should fail`, async () => {
    fakeAppointmentRepository.appointments = [];
    const output = new AppointmentNotFoundError('Appointment not found.');

    const sut: Either<BaseError, void> = await confirmAnAppointment.execute({
      appointmentId: 'any',
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
