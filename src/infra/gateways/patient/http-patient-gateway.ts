import { PatientGateway, PatientGatewayDTO } from '@application/gateways/patient-gateway';

import { HttpAdapter } from '@infra/adapters/http/http-adapter';

type Patient = {
  id: string;
};

type Error = {
  error: string;
};

export class HttpPatientGateway implements PatientGateway {
  public constructor(private readonly httpAdapter: HttpAdapter) {}

  async exists(id: string): Promise<boolean> {
    const response: Patient | Error = await this.httpAdapter.get<Patient | Error>(
      `http://localhost:3002/patients/${id}/exists`,
    );

    if ('error' in response) {
      return false;
    }

    return true;
  }

  async findOneById(id: string): Promise<PatientGatewayDTO | null> {
    const patient: Patient | Error = await this.httpAdapter.get<Patient | Error>(
      `http://localhost:3002/patients/${id}/exists`,
    );

    if ('error' in patient) {
      return null;
    }

    return {
      id: patient.id,
    };
  }
}
