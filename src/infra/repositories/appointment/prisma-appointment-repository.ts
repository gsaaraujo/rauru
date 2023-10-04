import {
  PrismaClient,
  Appointment as PrismaAppointment,
  AppointmentStatus as PrismaAppointmentStatus,
  TokenizedPayment as PrismaTokenizedPayment,
} from '@prisma/client/edge';

import { Money } from '@domain/models/money';
import { Appointment, AppointmentStatus } from '@domain/models/appointment/appointment';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';

export class PrismaAppointmentRepository implements AppointmentRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async create(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.create({
      data: {
        id: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        date: appointment.date,
        status: appointment.status,
        price: appointment.price.amount,
      },
    });
  }

  async update(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        id: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        date: appointment.date,
        status: appointment.status,
        price: appointment.price.amount,
      },
    });
  }

  public async findOneById(id: string): Promise<Appointment | null> {
    const prismaAppointmentFound: PrismaAppointment | null = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!prismaAppointmentFound) {
      return null;
    }

    const tokenizedPaymentFound: PrismaTokenizedPayment | null = await this.prisma.tokenizedPayment.findFirst({
      where: { patientId: prismaAppointmentFound.patientId },
    });

    if (!tokenizedPaymentFound) {
      return null;
    }

    const toAppointmentStatus = {
      [PrismaAppointmentStatus.PENDING]: AppointmentStatus.PENDING,
      [PrismaAppointmentStatus.CONFIRMED]: AppointmentStatus.CONFIRMED,
    };

    const appointment: Appointment = Appointment.reconstitute(prismaAppointmentFound.id, {
      doctorId: prismaAppointmentFound.doctorId,
      patientId: prismaAppointmentFound.patientId,
      date: prismaAppointmentFound.date,
      creditCardToken: tokenizedPaymentFound.creditCardToken,
      status: toAppointmentStatus[prismaAppointmentFound.status],
      price: Money.reconstitute({ amount: prismaAppointmentFound.price }),
    });

    return appointment;
  }

  public async isTimeSlotBookedAlready(timeSlot: Date): Promise<boolean> {
    const prismaAppointmentFound: PrismaAppointment | null = await this.prisma.appointment.findFirst({
      where: { date: timeSlot },
    });

    return !!prismaAppointmentFound;
  }
}
