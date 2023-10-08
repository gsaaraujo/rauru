import { z } from 'zod';
import { Request, Response } from 'express';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import {
  GetAllAppointmentsByDoctorIdService,
  GetAllAppointmentsByDoctorIdServiceOutput,
} from '@application/services/get-all-appointments-by-doctor-id-service';
import { DoctorNotFoundError } from '@application/errors/doctor-not-found-error';

export class ExpressGetAllAppointmentsByDoctorIdController {
  public constructor(private readonly getAllAppointmentsByDoctorIdService: GetAllAppointmentsByDoctorIdService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const schema = z.object({
        doctorId: z
          .string({ required_error: 'doctorId is required', invalid_type_error: 'doctorId must be string' })
          .trim()
          .uuid({ message: 'doctorId must be uuid' }),
      });

      const body = schema.safeParse(request.params);

      if (!body.success) {
        const errors = JSON.parse(body.error.message).map((error: { message: string }) => error.message);
        return response.status(400).send({ errors });
      }

      const getAllAppointmentsByDoctorIdService: Either<BaseError, GetAllAppointmentsByDoctorIdServiceOutput[]> =
        await this.getAllAppointmentsByDoctorIdService.execute({
          doctorId: request.params.doctorId,
        });

      if (getAllAppointmentsByDoctorIdService.isRight()) {
        return response.status(200).send(getAllAppointmentsByDoctorIdService.value);
      }

      const baseError: BaseError = getAllAppointmentsByDoctorIdService.value;

      if (baseError instanceof DoctorNotFoundError) {
        return response.status(404).send({ error: baseError.message });
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
