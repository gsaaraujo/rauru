import { PrismaClient, Appointment as PrismaAppointment } from '@prisma/client';

import { AppointmentDTO, AppointmentGateway } from '@application/gateways/appointment-gateway';

export class PrismaAppointmentGateway implements AppointmentGateway {
  public constructor(private readonly prisma: PrismaClient) {}

  async findAllByDoctorId(doctorId: string): Promise<AppointmentDTO[]> {
    const prismaAppointments: PrismaAppointment[] = await this.prisma.appointment.findMany({
      where: { doctorId },
    });

    return prismaAppointments.map((prismaAppointment) => ({
      id: prismaAppointment.id,
      doctorId: prismaAppointment.doctorId,
      patientId: prismaAppointment.patientId,
      date: prismaAppointment.date,
      price: prismaAppointment.price,
      status: prismaAppointment.status,
    }));
  }
}
