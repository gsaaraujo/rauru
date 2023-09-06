import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left } from '@shared/helpers/either';

import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentNotFoundError } from '@domain/errors/appointment-not-found-error';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';

export type ConfirmAnAppointmentInput = {
  appointmentId: string;
};

export type ConfirmAnAppointmentOutput = void;

export class ConfirmAnAppointment extends Usecase<ConfirmAnAppointmentInput, ConfirmAnAppointmentOutput> {
  public constructor(private readonly appointmentRepository: AppointmentRepository) {
    super();
  }

  public async execute(input: ConfirmAnAppointmentInput): Promise<Either<BaseError, void>> {
    const appointment: Appointment | null = await this.appointmentRepository.findOneById(input.appointmentId);

    if (!appointment) {
      const error = new AppointmentNotFoundError('Appointment not found.');
      return left(error);
    }

    throw new Error('Method not implemented.');
  }
}
