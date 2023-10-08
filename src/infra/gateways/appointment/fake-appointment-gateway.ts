import { AppointmentDTO, AppointmentGateway } from '@application/gateways/appointment-gateway';

export class FakeAppointmentGateway implements AppointmentGateway {
  public appointmentsDTO: AppointmentDTO[] = [];

  async findAllByDoctorId(doctorId: string): Promise<AppointmentDTO[]> {
    return this.appointmentsDTO.filter((appointmentDTO) => appointmentDTO.doctorId === doctorId);
  }
}
