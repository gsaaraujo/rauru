import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, right } from '@shared/helpers/either';

import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';

export type BookAnAppointmentInput = {
  doctorId: string;
  patientId: string;
  startsAt: Date;
  endsAt: Date;
};

export type BookAnAppointmentOutput = void;

export class BookAnAppointment extends Usecase<BookAnAppointmentInput, BookAnAppointmentOutput> {
  public constructor(private readonly appointmentRepository: AppointmentRepository) {
    super();
  }

  public async execute(input: BookAnAppointmentInput): Promise<Either<BaseError, void>> {
    const appointment = Appointment.create({});

    await this.appointmentRepository.create(appointment);
    return right(undefined);
  }
}
