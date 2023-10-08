import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentConfirmed } from '@domain/events/appointment-confirmed';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';

import { QueueAdapter } from '@application/adapters/queue-adapter';
import { AppointmentNotFoundError } from '@application/errors/appointment-not-found-error';

export type ConfirmAnAppointmentServiceInput = {
  appointmentId: string;
};

export type ConfirmAnAppointmentServiceOutput = void;

export class ConfirmAnAppointmentService extends Usecase<
  ConfirmAnAppointmentServiceInput,
  ConfirmAnAppointmentServiceOutput
> {
  public constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly queueAdapter: QueueAdapter,
  ) {
    super();
  }

  public async execute(input: ConfirmAnAppointmentServiceInput): Promise<Either<BaseError, void>> {
    const appointment: Appointment | null = await this.appointmentRepository.findOneById(input.appointmentId);

    if (!appointment) {
      const error = new AppointmentNotFoundError('Appointment not found.');
      return left(error);
    }

    appointment.confirmAppointment();
    await this.appointmentRepository.update(appointment);
    const appointmentConfirmed = new AppointmentConfirmed(appointment.id);
    await this.queueAdapter.publish('AppointmentConfirmed', JSON.stringify(appointmentConfirmed));
    return right(undefined);
  }
}
