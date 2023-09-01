import { describe, expect, it, beforeEach } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { BookAnAppointment } from '@domain/usecases/book-an-appointment';

import { FakeAppointmentRepository } from '@infra/repositories/appointment/fake-appointment';

describe('book-an-appointment', () => {
  let bookAnAppointment: BookAnAppointment;
  let fakeAppointmentRepository: FakeAppointmentRepository;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    bookAnAppointment = new BookAnAppointment(fakeAppointmentRepository);
  });

  it(`given the doctor has availability on his schedule
      when the patient attempt to book an appointment
      it should succeed`, async () => {
    fakeAppointmentRepository.appointments = [];

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'any',
      patientId: 'any',
      startsAt: new Date('2023-08-20T14:00:00Z'),
      endsAt: new Date('2023-08-20T14:30:00Z'),
    });

    expect(sut.isRight()).toBeTruthy();
    expect(fakeAppointmentRepository.appointments).toHaveLength(1);
  });
});
