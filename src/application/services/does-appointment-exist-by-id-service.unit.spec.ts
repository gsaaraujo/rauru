import { beforeEach, describe, expect, it } from 'vitest';

import { DoesAppointmentExistByIdService } from '@application/services/does-appointment-exist-by-id-service';

import { FakeAppointmentGateway } from '@infra/gateways/appointment/fake-appointment-gateway';
import { BaseError } from '@shared/helpers/base-error';
import { Either } from '@shared/helpers/either';
import { AppointmentNotFoundError } from '@application/errors/appointment-not-found-error';

describe('does-appointment-exist-by-id-service', () => {
  let fakeAppointmentGateway: FakeAppointmentGateway;
  let doesAppointmentExistByIdService: DoesAppointmentExistByIdService;

  beforeEach(() => {
    fakeAppointmentGateway = new FakeAppointmentGateway();
    doesAppointmentExistByIdService = new DoesAppointmentExistByIdService(fakeAppointmentGateway);
  });

  it('should return true if appointment exists', async () => {
    fakeAppointmentGateway.appointmentsDTO = [
      {
        id: 'a2845b93-b0e5-4484-8872-1a9369c163e1',
        doctorId: '83bd9fcc-58fa-4698-95d6-00a40ca1de9e',
        patientId: 'any',
        price: 140,
        status: 'PENDING',
        date: new Date('2021-01-01T10:00:00.000Z'),
      },
    ];

    const sut: Either<BaseError, boolean> = await doesAppointmentExistByIdService.execute({
      id: 'a2845b93-b0e5-4484-8872-1a9369c163e1',
    });

    expect(sut.isRight()).toBeTruthy();
    expect(sut.value).toBeTruthy();
  });

  it('should return error if appointment does not exist', async () => {
    const output = new AppointmentNotFoundError('Appointment not found.');
    fakeAppointmentGateway.appointmentsDTO = [];

    const sut: Either<BaseError, boolean> = await doesAppointmentExistByIdService.execute({
      id: 'a2845b93-b0e5-4484-8872-1a9369c163e1',
    });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
