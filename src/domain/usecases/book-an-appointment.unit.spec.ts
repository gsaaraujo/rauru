import { describe, expect, it, beforeEach } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Money } from '@domain/models/money';
import { BookAnAppointment } from '@domain/usecases/book-an-appointment';
import { DoctorNotFoundError } from '@domain/errors/doctor-not-found-error';
import { PatientNotFoundError } from '@domain/errors/patient-not-found-error';
import { ScheduleNotFoundError } from '@domain/errors/schedule-not-found-error';
import { DaysOfAvailability, Schedule } from '@domain/models/schedule/schedule';
import { TimeSlotNotFoundError } from '@domain/errors/time-slot-not-found-error';

import { FakeQueueAdapter } from '@infra/adapters/queue/fake-queue-adapter';
import { FakeDoctorGateway } from '@infra/gateways/doctor/fake-doctor-gateway';
import { FakePatientGateway } from '@infra/gateways/patient/fake-patient-gateway';
import { FakeScheduleRepository } from '@infra/repositories/schedule/fake-schedule-repository';
import { FakeAppointmentRepository } from '@infra/repositories/appointment/fake-appointment-repository';

describe('book-an-appointment', () => {
  let bookAnAppointment: BookAnAppointment;
  let fakeScheduleRepository: FakeScheduleRepository;
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let fakeDoctorGateway: FakeDoctorGateway;
  let fakePatientGateway: FakePatientGateway;
  let fakeQueueAdapter: FakeQueueAdapter;

  beforeEach(() => {
    fakeQueueAdapter = new FakeQueueAdapter();
    fakeDoctorGateway = new FakeDoctorGateway();
    fakePatientGateway = new FakePatientGateway();
    fakeScheduleRepository = new FakeScheduleRepository();
    fakeAppointmentRepository = new FakeAppointmentRepository();
    bookAnAppointment = new BookAnAppointment(
      fakeScheduleRepository,
      fakeAppointmentRepository,
      fakeDoctorGateway,
      fakePatientGateway,
      fakeQueueAdapter,
    );
  });

  it(`given the doctor has available time slot on a specific date
      when the patient attempt to book an appointment
      then it should succeed`, async () => {
    fakeQueueAdapter.messages = [];
    fakeDoctorGateway.doctors = [{ id: 'f5705c67-4c74-4cea-a993-9fa1c56164b6' }];
    fakePatientGateway.patients = [{ id: '9ea8f5df-a906-4852-940b-9cb28784eb62' }];
    fakeScheduleRepository.schedules = [
      Schedule.reconstitute('any', {
        doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
        price: Money.reconstitute({ amount: 120 }),
        daysOfAvailability: [DaysOfAvailability.MONDAY],
        timeSlots: ['08:00'],
      }),
    ];
    fakeAppointmentRepository.appointments = [];

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      price: 140,
      creditCardToken: 'any',
      date: new Date('2100-09-27T08:00:00.000Z'),
    });

    expect(sut.isRight()).toBeTruthy();
    expect(fakeAppointmentRepository.appointments).toHaveLength(1);
    expect(fakeQueueAdapter.messages).toHaveLength(1);
    expect(fakeQueueAdapter.messages[0].name).toBe('AppointmentBooked');
  });

  it(`given the doctor has no available time slot on a specific date
      when the patient attempt to book an appointment
      then it should fail`, async () => {
    fakeDoctorGateway.doctors = [{ id: 'f5705c67-4c74-4cea-a993-9fa1c56164b6' }];
    fakePatientGateway.patients = [{ id: '9ea8f5df-a906-4852-940b-9cb28784eb62' }];
    fakeScheduleRepository.schedules = [
      Schedule.reconstitute('any', {
        doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
        timeSlots: [],
        daysOfAvailability: [],
        price: Money.reconstitute({ amount: 120 }),
      }),
    ];

    const output: BaseError = new TimeSlotNotFoundError('The doctor has not defined a time slot for this date.');

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      price: 140,
      creditCardToken: 'any',
      date: new Date('2100-09-27T08:00:00.000Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it(`given the doctor has no time slot on a specific date
      when the patient attempt to book an appointment
      then it should fail`, async () => {
    fakeDoctorGateway.doctors = [{ id: 'f5705c67-4c74-4cea-a993-9fa1c56164b6' }];
    fakePatientGateway.patients = [{ id: '9ea8f5df-a906-4852-940b-9cb28784eb62' }];
    fakeScheduleRepository.schedules = [
      Schedule.reconstitute('any', {
        doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
        timeSlots: [],
        price: Money.reconstitute({ amount: 120 }),
        daysOfAvailability: [DaysOfAvailability.FRIDAY],
      }),
    ];
    const output: BaseError = new TimeSlotNotFoundError('The doctor has not defined a time slot for this date.');

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      price: 140,
      creditCardToken: 'any',
      date: new Date('2100-08-18T08:00:00.000Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if no schedule was found', async () => {
    fakeDoctorGateway.doctors = [{ id: 'f5705c67-4c74-4cea-a993-9fa1c56164b6' }];
    fakePatientGateway.patients = [{ id: '9ea8f5df-a906-4852-940b-9cb28784eb62' }];
    const error: BaseError = new ScheduleNotFoundError('No schedule was found for this doctor.');

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      price: 140,
      creditCardToken: 'any',
      date: new Date('2100-08-18T08:00:00.000Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(error);
  });

  it('should fail if no patient was found with the provided patientId', async () => {
    fakeDoctorGateway.doctors = [{ id: 'f5705c67-4c74-4cea-a993-9fa1c56164b6' }];
    fakePatientGateway.patients = [];
    const error: BaseError = new PatientNotFoundError('No patient was found.');

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      price: 140,
      creditCardToken: 'any',
      date: new Date('2100-08-18T08:00:00.000Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(error);
  });

  it('should fail if no doctor was found with the provided doctorId', async () => {
    fakeDoctorGateway.doctors = [];
    fakePatientGateway.patients = [{ id: '9ea8f5df-a906-4852-940b-9cb28784eb62' }];
    const error: BaseError = new DoctorNotFoundError('No doctor was found.');

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      price: 140,
      creditCardToken: 'any',
      date: new Date('2100-08-18T08:00:00.000Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(error);
  });
});
