import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Money } from '@domain/models/money';
import { Schedule } from '@domain/models/schedule/schedule';
import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentBooked } from '@domain/events/appointment-booked';
import { DoctorNotFoundError } from '@domain/errors/doctor-not-found-error';
import { PatientNotFoundError } from '@domain/errors/patient-not-found-error';
import { ScheduleNotFoundError } from '@domain/errors/schedule-not-found-error';
import { ScheduleRepository } from '@domain/models/schedule/schedule-repository';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';
import { TimeSlotAlreadyBookedError } from '@domain/errors/time-slot-already-booked-error';

import { QueueAdapter } from '@infra/adapters/queue/queue-adapter';
import { DoctorGateway } from '@infra/gateways/doctor/doctor-gateway';
import { PatientGateway } from '@infra/gateways/patient/patient-gateway';
import { DateTime } from '@domain/models/date-time';

export type BookAnAppointmentInput = {
  doctorId: string;
  patientId: string;
  price: number;
  creditCardToken: string;
  date: string;
  time: string;
};

export type BookAnAppointmentOutput = void;

export class BookAnAppointment extends Usecase<BookAnAppointmentInput, BookAnAppointmentOutput> {
  public constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorGateway: DoctorGateway,
    private readonly patientGateway: PatientGateway,
    private readonly queueAdapter: QueueAdapter,
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

    const isTimeSlotAvailableOrError: Either<BaseError, boolean> = scheduleFound.isTimeSlotAvailable(
      input.date,
      input.time,
    );

    if (isTimeSlotAvailableOrError.isLeft()) {
      const error: BaseError = isTimeSlotAvailableOrError.value;
      return left(error);
    }

    const isTimeSlotAvailable: boolean = isTimeSlotAvailableOrError.value;

    if (!isTimeSlotAvailable) {
      const error = new TimeSlotAlreadyBookedError('This time slot is already booked. Choose another one.');
      return left(error);
    }

    const moneyOrError: Either<BaseError, Money> = Money.create({ amount: input.price });

    if (moneyOrError.isLeft()) {
      const error: BaseError = moneyOrError.value;
      return left(error);
    }

    const money: Money = moneyOrError.value;

    const dateTimeOrError: Either<BaseError, DateTime> = DateTime.create({ date: input.date, time: input.time });

    if (dateTimeOrError.isLeft()) {
      const error: BaseError = dateTimeOrError.value;
      return left(error);
    }

    const dateTime: DateTime = dateTimeOrError.value;

    const appointmentOrError: Either<BaseError, Appointment> = Appointment.create({
      doctorId: input.doctorId,
      patientId: input.patientId,
      dateTime,
      price: money,
      creditCardToken: input.creditCardToken,
    });

    if (appointmentOrError.isLeft()) {
      const error: BaseError = appointmentOrError.value;
      return left(error);
    }

    const appointment: Appointment = appointmentOrError.value;
    await this.appointmentRepository.create(appointment);
    const appointmentBooked = new AppointmentBooked(
      appointment.id,
      appointment.price.amount,
      appointment.creditCardToken,
    );
    await this.queueAdapter.publish('AppointmentBooked', JSON.stringify(appointmentBooked));
    return right(undefined);
  }
}
