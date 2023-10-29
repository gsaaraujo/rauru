import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { AppointmentGateway } from '@application/gateways/appointment-gateway';
import { AppointmentNotFoundError } from '@application/errors/appointment-not-found-error';

export type DoesAppointmentExistByIdServiceInput = {
  id: string;
};

export type DoesAppointmentExistByIdServiceOutput = boolean;

export class DoesAppointmentExistByIdService extends Usecase<
  DoesAppointmentExistByIdServiceInput,
  DoesAppointmentExistByIdServiceOutput
> {
  public constructor(private readonly appointmentGateway: AppointmentGateway) {
    super();
  }

  public async execute(
    input: DoesAppointmentExistByIdServiceInput,
  ): Promise<Either<BaseError, DoesAppointmentExistByIdServiceOutput>> {
    const exists: boolean = await this.appointmentGateway.existsById(input.id);

    if (!exists) {
      const error = new AppointmentNotFoundError('Appointment not found.');
      return left(error);
    }

    return right(true);
  }
}
