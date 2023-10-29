import { DoctorGateway } from '@application/gateways/doctor-gateway';

import { HttpAdapter } from '@infra/adapters/http/http-adapter';

type Doctor = {
  id: string;
};

type Error = {
  error: string;
};

export class HttpDoctorGateway implements DoctorGateway {
  public constructor(private readonly httpAdapter: HttpAdapter) {}

  async exists(id: string): Promise<boolean> {
    try {
      const response: Doctor | Error = await this.httpAdapter.get<Doctor | Error>(
        `http://localhost:3002/doctors/${id}/exists`,
      );

      if ('error' in response) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
