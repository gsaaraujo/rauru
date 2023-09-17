import { Patient as PrismaPatient, PrismaClient } from '@prisma/client';

import { PatientGateway } from '@infra/gateways/patient/patient-gateway';

export class PrismaPatientGateway implements PatientGateway {
  public constructor(private readonly prisma: PrismaClient) {}

  async exists(id: string): Promise<boolean> {
    const patientFound: PrismaPatient | null = await this.prisma.patient.findUnique({ where: { id } });
    return !!patientFound;
  }
}
