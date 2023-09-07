import { beforeEach, describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Money } from '@domain/models/money';
import { ConfirmAnAppointment } from '@domain/usecases/confirm-an-appointment';
import { AppointmentNotFoundError } from '@domain/errors/appointment-not-found-error';
import { Appointment, AppointmentStatus } from '@domain/models/appointment/appointment';

import { FakeQueueAdapter } from '@infra/adapters/queue/fake-queue-adapter';
import { FakeAppointmentRepository } from '@infra/repositories/appointment/fake-appointment-repository';

describe('confirm-an-appointment', () => {
  let confirmAnAppointment: ConfirmAnAppointment;
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let fakeQueueAdapter: FakeQueueAdapter;

  beforeEach(() => {
    fakeQueueAdapter = new FakeQueueAdapter();
    fakeAppointmentRepository = new FakeAppointmentRepository();
    confirmAnAppointment = new ConfirmAnAppointment(fakeAppointmentRepository, fakeQueueAdapter);
  });

  it(`given the patient has booked an appointment
      when pattient attempt to confirm an appointment
      then it should succeed`, async () => {
    fakeAppointmentRepository.appointments = [
      Appointment.reconstitute('a176041a-fffb-45d2-a485-b386071e5cb1', {
        doctorId: 'any',
        patientId: 'any',
        price: Money.reconstitute({ amount: 140 }),
        creditCardToken: 'any',
        status: AppointmentStatus.PENDING,
        date: new Date('2100-08-18T08:00:00Z'),
      }),
    ];
    fakeQueueAdapter.messages = [];

    const sut: Either<BaseError, void> = await confirmAnAppointment.execute({
      appointmentId: 'a176041a-fffb-45d2-a485-b386071e5cb1',
    });

    expect(sut.isRight()).toBeTruthy();
    expect(fakeQueueAdapter.messages).toHaveLength(1);
    expect(fakeAppointmentRepository.appointments[0].status).toStrictEqual(AppointmentStatus.CONFIRMED);
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
