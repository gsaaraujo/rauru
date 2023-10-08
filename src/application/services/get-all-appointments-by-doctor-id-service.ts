import { Usecase } from '@shared/helpers/usecase';
import { BaseError } from '@shared/helpers/base-error';
import { Either, left, right } from '@shared/helpers/either';

import { DoctorGateway } from '@application/gateways/doctor-gateway';
import { DoctorNotFoundError } from '@application/errors/doctor-not-found-error';
import { AppointmentDTO, AppointmentGateway } from '@application/gateways/appointment-gateway';

export type GetAllAppointmentsByDoctorIdServiceInput = {
  doctorId: string;
};

export type GetAllAppointmentsByDoctorIdServiceOutput = {
  id: string;
  date: Date;
  doctorId: string;
  patientId: string;
  price: number;
  status: string;
};

export class GetAllAppointmentsByDoctorIdService extends Usecase<
  GetAllAppointmentsByDoctorIdServiceInput,
  GetAllAppointmentsByDoctorIdServiceOutput[]
> {
  public constructor(
    private readonly appointmentGateway: AppointmentGateway,
    private readonly doctorGateway: DoctorGateway,
  ) {
    super();
  }

  public async execute(
    input: GetAllAppointmentsByDoctorIdServiceInput,
  ): Promise<Either<BaseError, GetAllAppointmentsByDoctorIdServiceOutput[]>> {
    const doctorExists: boolean = await this.doctorGateway.exists(input.doctorId);

    if (!doctorExists) {
      const error: BaseError = new DoctorNotFoundError('No doctor was found.');
      return left(error);
    }

    const appointmentsDTO: AppointmentDTO[] = await this.appointmentGateway.findAllByDoctorId(input.doctorId);
    const output: GetAllAppointmentsByDoctorIdServiceOutput[] = appointmentsDTO.map((appointmentDTO) => ({
      id: appointmentDTO.id,
      date: appointmentDTO.date,
      doctorId: appointmentDTO.doctorId,
      patientId: appointmentDTO.patientId,
      price: appointmentDTO.price,
      status: appointmentDTO.status,
    }));

    return right(output);
  }
}
