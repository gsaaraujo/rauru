import { DoctorGateway, DoctorGatewayDTO } from '@domain/gateways/doctor-gateway';

export class FakeDoctorGateway implements DoctorGateway {
  public doctors: DoctorGatewayDTO[] = [];

  async exists(id: string): Promise<boolean> {
    return !!this.doctors.find((Doctor) => Doctor.id === id);
  }
}
