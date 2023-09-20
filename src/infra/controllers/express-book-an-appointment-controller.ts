import { z } from 'zod';
import { Request, Response } from 'express';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { BookAnAppointment } from '@domain/usecases/book-an-appointment';
import { DoctorNotFoundError } from '@domain/errors/doctor-not-found-error';
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
      const schema = z.object({
        doctorId: z
          .string({ required_error: 'doctorId is required', invalid_type_error: 'doctorId must be string' })
          .trim()
          .uuid({ message: 'doctorId must be uuid' }),
        patientId: z
          .string({ required_error: 'patientId is required', invalid_type_error: 'patientId must be string' })
          .trim()
          .uuid({ message: 'patientId must be uuid' }),
        price: z.number({ required_error: 'price is required', invalid_type_error: 'price must be number' }),
        date: z
          .string({ required_error: 'date is required', invalid_type_error: 'date must be string' })
          .trim()
          .regex(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, { message: "date must be 'dd/mm/aaaa' format" }),
        time: z
          .string({ required_error: 'time is required', invalid_type_error: 'time must be string' })
          .trim()
          .regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: "time must be 'hh:mm' (24h) format" }),
        creditCardToken: z
          .string({
            required_error: 'creditCardToken is required',
            invalid_type_error: 'creditCardToken must be string',
          })
          .trim()
          .nonempty({ message: 'creditCardToken cannot be empty' }),
      });

      const body = schema.safeParse(request.body);

      if (!body.success) {
        const errors = JSON.parse(body.error.message).map((error: { message: string }) => error.message);
        return response.status(400).send({ errors });
      }

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
