import { beforeEach, describe, expect, it } from 'vitest';

import {
  GetOneAppointmentByIdService,
  GetOneAppointmentByIdServiceOutput,
} from '@application/services/get-one-appointment-by-id-service';

import { FakeAppointmentGateway } from '@infra/gateways/appointment/fake-appointment-gateway';
import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';
import { AppointmentNotFoundError } from '@application/errors/appointment-not-found-error';

describe('get-one-appointment-by-id-service', () => {
  let getOneAppointmentByIdService: GetOneAppointmentByIdService;
  let fakeAppointmentGateway: FakeAppointmentGateway;

  beforeEach(() => {
    fakeAppointmentGateway = new FakeAppointmentGateway();
    getOneAppointmentByIdService = new GetOneAppointmentByIdService(fakeAppointmentGateway);
  });

  it('should succeed and return one appointment', async () => {
    const output = {
      id: 'a2845b93-b0e5-4484-8872-1a9369c163e1',
      doctorId: '83bd9fcc-58fa-4698-95d6-00a40ca1de9e',
      patientId: 'any',
      price: 140,
      status: 'PENDING',
      date: new Date('2021-01-01T10:00:00.000Z'),
    };
    fakeAppointmentGateway.appointmentsDTO = [output];

    const sut: Either<BaseError, GetOneAppointmentByIdServiceOutput> = await getOneAppointmentByIdService.execute({
      id: 'a2845b93-b0e5-4484-8872-1a9369c163e1',
    });

    expect(sut.isRight()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail and return and error', async () => {
    const output = new AppointmentNotFoundError('Appointment not found.');
    fakeAppointmentGateway.appointmentsDTO = [];

    const sut = await getOneAppointmentByIdService.execute({ id: 'a2845b93-b0e5-4484-8872-1a9369c163e1' });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
