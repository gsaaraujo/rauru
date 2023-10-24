import { PrismaClient } from '@prisma/client';

import { PatientGateway } from '@application/gateways/patient-gateway';

export class PrismaPatientGateway implements PatientGateway {
  public constructor(private readonly prisma: PrismaClient) {}

  async exists(id: string): Promise<boolean> {
    return true;
  }
}
