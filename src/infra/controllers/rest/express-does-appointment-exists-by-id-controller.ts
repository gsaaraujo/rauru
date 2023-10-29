import { z } from 'zod';
import { Request, Response } from 'express';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import {
  DoesAppointmentExistByIdService,
  DoesAppointmentExistByIdServiceOutput,
} from '@application/services/does-appointment-exist-by-id-service';
import { AppointmentNotFoundError } from '@application/errors/appointment-not-found-error';

export class ExpressDoesAppointmentExistByIdController {
  constructor(private readonly doesAppointmentExistByIdService: DoesAppointmentExistByIdService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const schema = z.object({
        id: z
          .string({ required_error: 'id is required', invalid_type_error: 'id must be string' })
          .trim()
          .uuid({ message: 'id must be uuid' }),
      });

      const body = schema.safeParse(request.params);

      if (!body.success) {
        const errors = JSON.parse(body.error.message).map((error: { message: string }) => error.message);
        return response.status(400).send({ errors });
      }

      const doesAppointmentExistByIdService: Either<BaseError, DoesAppointmentExistByIdServiceOutput> =
        await this.doesAppointmentExistByIdService.execute({
          id: request.params.id,
        });

      if (doesAppointmentExistByIdService.isRight()) {
        return response.status(200).send({ appointmentExists: doesAppointmentExistByIdService.value });
      }

      const baseError: BaseError = doesAppointmentExistByIdService.value;

      if (baseError instanceof AppointmentNotFoundError) {
        return response.status(404).send({ error: baseError.message });
      }

      return response.status(500).send({
        errorMessage: 'Something unexpected happened',
      });

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
