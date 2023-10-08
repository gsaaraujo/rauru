import { PatientGateway, PatientGatewayDTO } from '@application/gateways/patient-gateway';

export class FakePatientGateway implements PatientGateway {
  public patients: PatientGatewayDTO[] = [];

  async exists(id: string): Promise<boolean> {
    return !!this.patients.find((patient) => patient.id === id);
  }
}
