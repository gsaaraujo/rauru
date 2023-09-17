import {
  PrismaClient,
  Appointment as PrismaAppointment,
  AppointmentStatus as PrismaAppointmentStatus,
  TokenizedPayment as PrismaTokenizedPayment,
} from '@prisma/client/edge';

import { Money } from '@domain/models/money';
import { Appointment, AppointmentStatus } from '@domain/models/appointment/appointment';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';
import { DateTime } from '@domain/models/date-time';

export class PrismaAppointmentRepository implements AppointmentRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async create(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.create({
      data: {
        id: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        date: appointment.dateTime.dateTime,
        status: appointment.status,
        price: appointment.price.amount,
      },
    });
  }

  public async findOneById(id: string): Promise<Appointment | null> {
    const prismaAppointmentFound: PrismaAppointment | null = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!prismaAppointmentFound) return null;

    const tokenizedPaymentFound: PrismaTokenizedPayment | null = await this.prisma.tokenizedPayment.findUnique({
      where: { id: prismaAppointmentFound.patientId },
    });

    if (!tokenizedPaymentFound) return null;

    const toAppointmentStatus = {
      [PrismaAppointmentStatus.PENDING]: AppointmentStatus.PENDING,
      [PrismaAppointmentStatus.CONFIRMED]: AppointmentStatus.CONFIRMED,
    };

    const formatDate = prismaAppointmentFound.date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const formatTime = prismaAppointmentFound.date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const appointment: Appointment = Appointment.reconstitute(prismaAppointmentFound.id, {
      doctorId: prismaAppointmentFound.doctorId,
      patientId: prismaAppointmentFound.patientId,
      dateTime: DateTime.reconstitute({ date: formatDate, time: formatTime }),
      creditCardToken: tokenizedPaymentFound.creditCardToken,
      status: toAppointmentStatus[prismaAppointmentFound.status],
      price: Money.reconstitute({ amount: prismaAppointmentFound.price }),
    });

    return appointment;
  }
}
