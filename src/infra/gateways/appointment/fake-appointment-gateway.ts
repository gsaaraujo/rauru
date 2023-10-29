import { AppointmentDTO, AppointmentGateway } from '@application/gateways/appointment-gateway';

export class FakeAppointmentGateway implements AppointmentGateway {
  public appointmentsDTO: AppointmentDTO[] = [];

  async existsById(id: string): Promise<boolean> {
    const appointmentDTO: AppointmentDTO | undefined = this.appointmentsDTO.find(
      (appointmentDTO) => appointmentDTO.id === id,
    );
    return !!appointmentDTO;
  }

  async findAllByDoctorId(doctorId: string): Promise<AppointmentDTO[]> {
    return this.appointmentsDTO.filter((appointmentDTO) => appointmentDTO.doctorId === doctorId);
  }

  async findOneById(id: string): Promise<AppointmentDTO | null> {
    const appointmentDTO: AppointmentDTO | undefined = this.appointmentsDTO.find(
      (appointmentDTO) => appointmentDTO.id === id,
    );

    if (appointmentDTO === undefined) {
      return null;
    }

    return appointmentDTO;
  }
}
