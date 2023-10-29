import { AppointmentGateway } from '@application/gateways/appointment-gateway';
import { BaseError } from '@shared/helpers/base-error';
import { Either, right } from '@shared/helpers/either';
import { Usecase } from '@shared/helpers/usecase';

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
    return right(exists);
  }
}
