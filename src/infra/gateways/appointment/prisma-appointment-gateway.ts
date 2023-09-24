import { PrismaClient, Appointment as PrismaAppointment } from '@prisma/client';

import { AppointmentDTO, AppointmentGateway } from '@infra/gateways/appointment/appointment-gateway';

export class PrismaAppointmentGateway implements AppointmentGateway {
  public constructor(private readonly prisma: PrismaClient) {}

  async findAllByDoctorId(doctorId: string): Promise<AppointmentDTO[]> {
    const prismaAppintments: PrismaAppointment[] = await this.prisma.appointment.findMany({
      where: { doctorId },
    });

    return prismaAppintments.map((prismaAppointment) => ({
      id: prismaAppointment.id,
      doctorId: prismaAppointment.doctorId,
      patientId: prismaAppointment.patientId,
      date: prismaAppointment.date,
      price: prismaAppointment.price,
      status: prismaAppointment.status,
    }));
  }
}
