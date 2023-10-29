import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { AppointmentDTO, AppointmentGateway } from '@application/gateways/appointment-gateway';
import { AppointmentNotFoundError } from '@application/errors/appointment-not-found-error';

export type GetOneAppointmentByIdServiceInput = {
  id: string;
};

export type GetOneAppointmentByIdServiceOutput = {
  id: string;
  date: Date;
  doctorId: string;
  patientId: string;
  price: number;
  status: string;
};

export class GetOneAppointmentByIdService extends Usecase<
  GetOneAppointmentByIdServiceInput,
  GetOneAppointmentByIdServiceOutput
> {
  public constructor(private readonly appointmentGateway: AppointmentGateway) {
    super();
  }

  public async execute(
    input: GetOneAppointmentByIdServiceInput,
  ): Promise<Either<BaseError, GetOneAppointmentByIdServiceOutput>> {
    const appointmentDTO: AppointmentDTO | null = await this.appointmentGateway.findOneById(input.id);

    if (appointmentDTO === null) {
      const error = new AppointmentNotFoundError('Appointment not found.');
      return left(error);
    }

    const output: GetOneAppointmentByIdServiceOutput = {
      id: appointmentDTO.id,
      date: appointmentDTO.date,
      doctorId: appointmentDTO.doctorId,
      patientId: appointmentDTO.patientId,
      price: appointmentDTO.price,
      status: appointmentDTO.status,
    };

    return right(output);
  }
}
