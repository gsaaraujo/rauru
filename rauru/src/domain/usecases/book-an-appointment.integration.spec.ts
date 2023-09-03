import { describe, expect, it, beforeEach } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Schedule } from '@domain/models/schedule/schedule';
import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';
import { BookAnAppointment } from '@domain/usecases/book-an-appointment';
import { PatientNotFoundError } from '@domain/errors/patient-not-found-error';
import { ScheduleNotFoundError } from '@domain/errors/schedule-not-found-error';
import { TimeSlotNotFoundError } from '@domain/errors/time-slot-not-found-error';
import { TimeSlotAlreadyBookedError } from '@domain/errors/time-slot-already-booked-error';

import { FakePatientGateway } from '@infra/gateways/patient/fake-patient-gateway';
import { FakeScheduleRepository } from '@infra/repositories/schedule/fake-schedule-repository';
import { FakeAppointmentRepository } from '@infra/repositories/appointment/fake-appointment-repository';

describe('book-an-appointment', () => {
  let bookAnAppointment: BookAnAppointment;
  let fakeScheduleRepository: FakeScheduleRepository;
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let fakePatientGateway: FakePatientGateway;

  beforeEach(() => {
    fakePatientGateway = new FakePatientGateway();
    fakeScheduleRepository = new FakeScheduleRepository();
    fakeAppointmentRepository = new FakeAppointmentRepository();
    bookAnAppointment = new BookAnAppointment(fakeScheduleRepository, fakeAppointmentRepository, fakePatientGateway);
  });

  it(`given the doctor has available time slot on a specific date
      when the patient attempt to book an appointment
      then it should succeed`, async () => {
    fakePatientGateway.patients = [{ id: '9ea8f5df-a906-4852-940b-9cb28784eb62' }];
    fakeScheduleRepository.schedules = [
      Schedule.reconstitute({
        doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
        timeSlots: [
          TimeSlot.reconstitute({
            date: new Date('2100-08-20T14:00:00Z'),
            status: TimeSlotStatus.AVAILABLE,
          }),
        ],
      }),
    ];
    fakeAppointmentRepository.appointments = [];

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      timeSlot: new Date('2100-08-20T14:00:00Z'),
    });

    expect(sut.isRight()).toBeTruthy();
    expect(fakeAppointmentRepository.appointments).toHaveLength(1);
  });

  it(`given the doctor has no available time slot on a specific date
      when the patient attempt to book an appointment
      then it should fail`, async () => {
    fakePatientGateway.patients = [{ id: '9ea8f5df-a906-4852-940b-9cb28784eb62' }];
    fakeScheduleRepository.schedules = [
      Schedule.reconstitute({
        doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
        timeSlots: [
          TimeSlot.reconstitute({
            date: new Date('2100-08-20T14:00:00Z'),
            status: TimeSlotStatus.UNAVAILABLE,
          }),
        ],
      }),
    ];
    const output: BaseError = new TimeSlotAlreadyBookedError('This time slot is already booked. Choose another one.');

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      timeSlot: new Date('2100-08-20T14:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it(`given the doctor has no time slot on a specific date
      when the patient attempt to book an appointment
      then it should fail`, async () => {
    fakePatientGateway.patients = [{ id: '9ea8f5df-a906-4852-940b-9cb28784eb62' }];
    fakeScheduleRepository.schedules = [
      Schedule.reconstitute({
        doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
        timeSlots: [],
      }),
    ];
    const output: BaseError = new TimeSlotNotFoundError('The doctor has not defined a time slot for this date.');

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      timeSlot: new Date('2100-08-20T14:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if no schedule was found', async () => {
    fakePatientGateway.patients = [{ id: '9ea8f5df-a906-4852-940b-9cb28784eb62' }];
    const error: BaseError = new ScheduleNotFoundError('No schedule was found for this doctor.');

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      timeSlot: new Date('2100-08-20T14:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(error);
  });

  it('should fail if no patient was found', async () => {
    const error: BaseError = new PatientNotFoundError('No patient was found.');

    const sut: Either<BaseError, void> = await bookAnAppointment.execute({
      doctorId: 'f5705c67-4c74-4cea-a993-9fa1c56164b6',
      patientId: '9ea8f5df-a906-4852-940b-9cb28784eb62',
      timeSlot: new Date('2100-08-20T14:00:00Z'),
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(error);
  });
});
