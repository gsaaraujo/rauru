import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Schedule } from '@domain/models/schedule/schedule';
import { Appointment } from '@domain/models/appointment/appointment';
import { ScheduleNotFoundError } from '@domain/errors/schedule-not-found-error';
import { ScheduleRepository } from '@domain/models/schedule/schedule-repository';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';
import { TimeSlotAlreadyBookedError } from '@domain/errors/time-slot-already-booked-error';

export type BookAnAppointmentInput = {
  doctorId: string;
  patientId: string;
  timeSlot: Date;
};

export type BookAnAppointmentOutput = void;

export class BookAnAppointment extends Usecase<BookAnAppointmentInput, BookAnAppointmentOutput> {
  public constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly appointmentRepository: AppointmentRepository,
  ) {
    super();
  }

  public async execute(input: BookAnAppointmentInput): Promise<Either<BaseError, void>> {
    const scheduleFound: Schedule | null = await this.scheduleRepository.findOneByDoctorId(input.doctorId);

    if (!scheduleFound) {
      const error: BaseError = new ScheduleNotFoundError('No schedule was found for this doctor.');
      return left(error);
    }

    const isTimeSlotAvailableOrError: Either<BaseError, boolean> = scheduleFound.isTimeSlotAvailable(input.timeSlot);

    if (isTimeSlotAvailableOrError.isLeft()) {
      const error: BaseError = isTimeSlotAvailableOrError.value;
      return left(error);
    }

    const isTimeSlotAvailable: boolean = isTimeSlotAvailableOrError.value;

    if (!isTimeSlotAvailable) {
      const error = new TimeSlotAlreadyBookedError('This time slot is already booked. Choose another one.');
      return left(error);
    }

    const appointmentOrError: Either<BaseError, Appointment> = Appointment.create({
      doctorId: input.doctorId,
      patientId: input.patientId,
      date: input.timeSlot,
    });

    if (appointmentOrError.isLeft()) {
      const error: BaseError = appointmentOrError.value;
      return left(error);
    }

    const appointment: Appointment = appointmentOrError.value;
    await this.appointmentRepository.create(appointment);
    return right(undefined);
  }
}
