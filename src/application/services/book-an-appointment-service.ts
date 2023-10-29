import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { Money } from '@domain/models/money';
import { Schedule } from '@domain/models/schedule/schedule';
import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentBooked } from '@domain/events/appointment-booked';
import { ScheduleRepository } from '@domain/models/schedule/schedule-repository';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';

import { QueueAdapter } from '@application/adapters/queue-adapter';
import { DoctorGateway } from '@application/gateways/doctor-gateway';
import { PatientGateway } from '@application/gateways/patient-gateway';
import { DoctorNotFoundError } from '@application/errors/doctor-not-found-error';
import { PatientNotFoundError } from '@application/errors/patient-not-found-error';
import { ScheduleNotFoundError } from '@application/errors/schedule-not-found-error';
import { TimeSlotNotDefinedError } from '@application/errors/time-slot-not-defined-error';
import { TimeSlotAlreadyBookedError } from '@application/errors/time-slot-already-booked-error';

export type BookAnAppointmentServiceInput = {
  doctorId: string;
  patientId: string;
  date: Date;
  price: number;
  creditCardToken: string;
};

export type BookAnAppointmentServiceOutput = void;

export class BookAnAppointmentService extends Usecase<BookAnAppointmentServiceInput, BookAnAppointmentServiceOutput> {
  public constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorGateway: DoctorGateway,
    private readonly patientGateway: PatientGateway,
    private readonly queueAdapter: QueueAdapter,
  ) {
    super();
  }

  public async execute(input: BookAnAppointmentServiceInput): Promise<Either<BaseError, void>> {
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

    if (!scheduleFound.hasTimeSlot(input.date)) {
      const error: BaseError = new TimeSlotNotDefinedError('The doctor has not defined a time slot for this date.');
      return left(error);
    }

    const isTimeSlotBookedAlready: boolean = await this.appointmentRepository.isTimeSlotBookedAlready(input.date);

    if (isTimeSlotBookedAlready) {
      const error = new TimeSlotAlreadyBookedError('This time slot is already booked. Choose another one.');
      return left(error);
    }

    const moneyOrError: Either<BaseError, Money> = Money.create({ amount: input.price });

    if (moneyOrError.isLeft()) {
      const error: BaseError = moneyOrError.value;
      return left(error);
    }

    const money: Money = moneyOrError.value;

    const appointmentOrError: Either<BaseError, Appointment> = Appointment.create({
      doctorId: input.doctorId,
      patientId: input.patientId,
      date: input.date,
      price: money,
      creditCardToken: input.creditCardToken,
    });

    if (appointmentOrError.isLeft()) {
      const error: BaseError = appointmentOrError.value;
      return left(error);
    }

    const appointment: Appointment = appointmentOrError.value;
    await this.appointmentRepository.create(appointment);
    const appointmentBooked = new AppointmentBooked(appointment.id);
    await this.queueAdapter.publish('AppointmentBooked', JSON.stringify(appointmentBooked));
    return right(undefined);
  }
}
