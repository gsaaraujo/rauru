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
    const response: Doctor | Error = await this.httpAdapter.get<Doctor | Error>(`http://xpto.com/api/doctors/${id}`);

    if ('error' in response) {
      return false;
    }

    return true;
  }
}
