import { z } from 'zod';
import { Request, Response } from 'express';

import { BaseError } from '@shared/helpers/base-error';

import { DoctorGateway } from '@infra/gateways/doctor/doctor-gateway';
import { DoctorNotFoundError } from '@infra/errors/doctor-not-found-error';
import { AppointmentDTO, AppointmentGateway } from '@infra/gateways/appointment/appointment-gateway';

export class ExpressGetAllAppointmentsByDoctorIdController {
  public constructor(
    private readonly appointmentGateway: AppointmentGateway,
    private readonly doctorGateway: DoctorGateway,
  ) {}

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

      const doctorExists: boolean = await this.doctorGateway.exists(request.params.doctorId);

      if (!doctorExists) {
        const error: BaseError = new DoctorNotFoundError('No doctor was found.');
        return response.status(404).send({ error: error.message });
      }

      const appointmentsDTO: AppointmentDTO[] = await this.appointmentGateway.findAllByDoctorId(
        request.params.doctorId,
      );

      return response.status(200).send(appointmentsDTO);
    } catch (error) {
      return response.status(500).send({
        errorMessage: 'Something unexpected happened',
      });
    }
  }
}
