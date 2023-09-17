import { Request, Response } from 'express';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { BookAnAppointment } from '@domain/usecases/book-an-appointment';
import { DoctorNotFoundError } from '@domain/errors/doctor-not-found-error';
import { InvalidPropertyError } from '@domain/errors/invalid-property-error';
import { PatientNotFoundError } from '@domain/errors/patient-not-found-error';
import { ScheduleNotFoundError } from '@domain/errors/schedule-not-found-error';
import { TimeSlotNotFoundError } from '@domain/errors/time-slot-not-found-error';
import { AppointmentNotFoundError } from '@domain/errors/appointment-not-found-error';
import { TimeSlotAlreadyBookedError } from '@domain/errors/time-slot-already-booked-error';
import { MoneyCannotBeNegativeError } from '@domain/errors/money-cannot-be-negative-error';
import { TimeSlotCannotBeInThePastError } from '@domain/errors/time-slot-cannot-be-in-the-past-error';
import { AppointmentCannotBeInThePastError } from '@domain/errors/appointment-cannot-be-in-the-past-error';

export class ExpressBookAnAppointmentController {
  constructor(private readonly bookAnAppointment: BookAnAppointment) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const bookAnAppointmentOrError: Either<BaseError, void> = await this.bookAnAppointment.execute({
        doctorId: request.body.doctorId,
        patientId: request.body.patientId,
        price: request.body.price,
        date: request.body.date,
        time: request.body.time,
        creditCardToken: request.body.creditCardToken,
      });

      if (bookAnAppointmentOrError.isRight()) {
        return response.status(204).send({});
      }

      const baseError: BaseError = bookAnAppointmentOrError.value;

      if (baseError instanceof InvalidPropertyError) {
        return response.status(400).send({ error: baseError.message });
      }

      if (
        baseError instanceof AppointmentCannotBeInThePastError ||
        baseError instanceof AppointmentNotFoundError ||
        baseError instanceof DoctorNotFoundError ||
        baseError instanceof MoneyCannotBeNegativeError ||
        baseError instanceof PatientNotFoundError ||
        baseError instanceof ScheduleNotFoundError ||
        baseError instanceof TimeSlotAlreadyBookedError ||
        baseError instanceof TimeSlotCannotBeInThePastError ||
        baseError instanceof TimeSlotNotFoundError
      ) {
        return response.status(409).send({ error: baseError.message });
      }

      return response.status(500).send({
        errorMessage: 'Something unexpected happened',
      });
    } catch (error) {
      console.error(error);
      return response.status(500).send({
        errorMessage: 'Something unexpected happened',
      });
    }
  }
}
