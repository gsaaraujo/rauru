import { Doctor as PrismaDoctor, PrismaClient } from '@prisma/client';

import { DoctorGateway } from '@application/gateways/doctor-gateway';

export class PrismaDoctorGateway implements DoctorGateway {
  public constructor(private readonly prisma: PrismaClient) {}

  async exists(id: string): Promise<boolean> {
    const doctorFound: PrismaDoctor | null = await this.prisma.doctor.findUnique({ where: { id } });
    return !!doctorFound;
  }
}
