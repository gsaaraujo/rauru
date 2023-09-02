import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';
import { TimeSlotAlreadyBookedError } from '@domain/errors/time-slot-already-booked-error';
import { ScheduleRepository } from '@domain/models/schedule/schedule-repository';
import { Schedule } from '@domain/models/schedule/schedule';

export type BookAnAppointmentInput = {
  doctorId: string;
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
    const appointment = Appointment.create({});

    const schedule: Schedule = await this.scheduleRepository.findOneByDoctorId(input.doctorId);
    const isTimeSlotAvailable: boolean = schedule.isTimeSlotAvailable(input.timeSlot);

    if (!isTimeSlotAvailable) {
      const error = new TimeSlotAlreadyBookedError('This time slot is already booked. Choose another one.');
      return left(error);
    }

    await this.appointmentRepository.create(appointment);
    return right(undefined);
  }
}
