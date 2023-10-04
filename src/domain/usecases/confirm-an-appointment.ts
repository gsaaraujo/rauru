import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentNotFoundError } from '@domain/errors/appointment-not-found-error';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';

import { QueueAdapter } from '@infra/adapters/queue/queue-adapter';
import { AppointmentConfirmed } from '@domain/events/appointment-confirmed';

export type ConfirmAnAppointmentInput = {
  appointmentId: string;
};

export type ConfirmAnAppointmentOutput = void;

export class ConfirmAnAppointment extends Usecase<ConfirmAnAppointmentInput, ConfirmAnAppointmentOutput> {
  public constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly queueAdapter: QueueAdapter,
  ) {
    super();
  }

  public async execute(input: ConfirmAnAppointmentInput): Promise<Either<BaseError, void>> {
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
