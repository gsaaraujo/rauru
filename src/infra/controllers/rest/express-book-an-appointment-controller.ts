import { z } from 'zod';
import { Request, Response } from 'express';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { TimeSlotNotFoundError } from '@domain/errors/time-slot-not-found-error';
import { MoneyCannotBeNegativeError } from '@domain/errors/money-cannot-be-negative-error';
import { BookAnAppointmentService } from '@application/services/book-an-appointment-service';
import { TimeSlotCannotBeInThePastError } from '@domain/errors/time-slot-cannot-be-in-the-past-error';
import { AppointmentCannotBeInThePastError } from '@domain/errors/appointment-cannot-be-in-the-past-error';

import { DoctorNotFoundError } from '@application/errors/doctor-not-found-error';
import { PatientNotFoundError } from '@application/errors/patient-not-found-error';
import { ScheduleNotFoundError } from '@application/errors/schedule-not-found-error';
import { TimeSlotNotDefinedError } from '@application/errors/time-slot-not-defined-error';
import { AppointmentNotFoundError } from '@application/errors/appointment-not-found-error';
import { TimeSlotAlreadyBookedError } from '@application/errors/time-slot-already-booked-error';

export class ExpressBookAnAppointmentController {
  constructor(private readonly bookAnAppointmentService: BookAnAppointmentService) {}

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
          .nonempty({ message: 'date cannot be empty' }),
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

      const bookAnAppointmentOrError: Either<BaseError, void> = await this.bookAnAppointmentService.execute({
        doctorId: request.body.doctorId,
        patientId: request.body.patientId,
        price: request.body.price,
        date: new Date(request.body.date),
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
        baseError instanceof TimeSlotNotFoundError ||
        baseError instanceof TimeSlotNotDefinedError
      ) {
        return response.status(409).send({ error: baseError.message });
      }

      return response.status(500).send({
        errorMessage: 'Something unexpected happened',
      });
    } catch (error) {
      return response.status(500).send({
        errorMessage: 'Something unexpected happened',
      });
    }
  }
}
