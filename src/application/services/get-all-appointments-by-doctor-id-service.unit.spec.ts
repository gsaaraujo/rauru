import { beforeEach, describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import {
  GetAllAppointmentsByDoctorIdService,
  GetAllAppointmentsByDoctorIdServiceOutput,
} from '@application/services/get-all-appointments-by-doctor-id-service';
import { DoctorNotFoundError } from '@application/errors/doctor-not-found-error';

import { FakeDoctorGateway } from '@infra/gateways/doctor/fake-doctor-gateway';
import { FakeAppointmentGateway } from '@infra/gateways/appointment/fake-appointment-gateway';

describe('get-all-appointments-by-doctor-id', () => {
  let getAllAppointmentsByDoctorIdService: GetAllAppointmentsByDoctorIdService;
  let fakeDoctorGateway: FakeDoctorGateway;
  let fakeAppointmentGateway: FakeAppointmentGateway;

  beforeEach(() => {
    fakeDoctorGateway = new FakeDoctorGateway();
    fakeAppointmentGateway = new FakeAppointmentGateway();
    getAllAppointmentsByDoctorIdService = new GetAllAppointmentsByDoctorIdService(
      fakeAppointmentGateway,
      fakeDoctorGateway,
    );
  });

  it('should return all appointments from a specific doctor', async () => {
    fakeDoctorGateway.doctors = [{ id: '83bd9fcc-58fa-4698-95d6-00a40ca1de9e' }];
    fakeAppointmentGateway.appointmentsDTO = [
      {
        id: 'any',
        doctorId: '83bd9fcc-58fa-4698-95d6-00a40ca1de9e',
        patientId: 'any',
        price: 140,
        status: 'PENDING',
        date: new Date('2021-01-01T10:00:00.000Z'),
      },
    ];

    const sut: Either<BaseError, GetAllAppointmentsByDoctorIdServiceOutput[]> =
      await getAllAppointmentsByDoctorIdService.execute({
        doctorId: '83bd9fcc-58fa-4698-95d6-00a40ca1de9e',
      });

    expect(sut.isRight()).toBeTruthy();
    expect(sut.value).toHaveLength(1);
  });

  it('should fail if doctor is not found', async () => {
    const error = new DoctorNotFoundError('No doctor was found.');

    const sut: Either<BaseError, GetAllAppointmentsByDoctorIdServiceOutput[]> =
      await getAllAppointmentsByDoctorIdService.execute({
        doctorId: '83bd9fcc-58fa-4698-95d6-00a40ca1de9e',
      });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(error);
  });
});
