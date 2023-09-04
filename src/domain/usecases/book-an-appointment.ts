import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Schedule } from '@domain/models/schedule/schedule';
import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentBooked } from '@domain/events/appointment-booked';
import { DoctorNotFoundError } from '@domain/errors/doctor-not-found-error';
import { PatientNotFoundError } from '@domain/errors/patient-not-found-error';
import { ScheduleNotFoundError } from '@domain/errors/schedule-not-found-error';
import { ScheduleRepository } from '@domain/models/schedule/schedule-repository';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';
import { TimeSlotAlreadyBookedError } from '@domain/errors/time-slot-already-booked-error';

import { DoctorGateway } from '@infra/gateways/doctor/doctor-gateway';
import { PatientGateway } from '@infra/gateways/patient/patient-gateway';
import { FakeQueueAdapter } from '@infra/adapters/queue/fake-queue-adapter';

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
    private readonly doctorGateway: DoctorGateway,
    private readonly patientGateway: PatientGateway,
    private readonly fakeQueueAdapter: FakeQueueAdapter,
  ) {
    super();
  }

  public async execute(input: BookAnAppointmentInput): Promise<Either<BaseError, void>> {
    const [doctorExists, patientExists] = await Promise.all([
      this.doctorGateway.exists(input.doctorId),
      this.patientGateway.exists(input.patientId),
    ]);

    if (!doctorExists) {
      const error: BaseError = new DoctorNotFoundError('No doctor was found.');
      return left(error);
    }

    if (!patientExists) {
      const error: BaseError = new PatientNotFoundError('No patient was found.');
      return left(error);
    }

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
    const appointmentBooked = new AppointmentBooked(appointment.id);
    this.fakeQueueAdapter.publish('AppointmentBooked', JSON.stringify(appointmentBooked));
    return right(undefined);
  }
}
