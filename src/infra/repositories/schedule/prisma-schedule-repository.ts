import {
  PrismaClient,
  Schedule as PrismaSchedule,
  TimeSlot as PrismaTimeSlot,
  TimeSlotStatus as PrismaTimeSlotStatus,
} from '@prisma/client';

import { DateTime } from '@domain/models/date-time';
import { Schedule } from '@domain/models/schedule/schedule';
import { ScheduleRepository } from '@domain/models/schedule/schedule-repository';
import { TimeSlot, TimeSlotStatus } from '@domain/models/time-slot';

export class PrismaScheduleRepository implements ScheduleRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findOneByDoctorId(id: string): Promise<Schedule | null> {
    const prismaScheduleFound: PrismaSchedule | null = await this.prisma.schedule.findFirst({
      where: { doctorId: id },
      include: { TimeSlot: true },
    });

    if (!prismaScheduleFound) return null;

    const prismaTimeSlotsFound: PrismaTimeSlot[] = await this.prisma.timeSlot.findMany({
      where: { scheduleId: prismaScheduleFound.id },
    });

    const schedule: Schedule = Schedule.reconstitute(prismaScheduleFound.id, {
      doctorId: prismaScheduleFound.doctorId,
      timeSlots: prismaTimeSlotsFound.map((prismaTimeSlotFound: PrismaTimeSlot) => {
        const formatDate = prismaTimeSlotFound.date.toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

        const formatTime = prismaTimeSlotFound.date.toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        const toTimeSlot = {
          [PrismaTimeSlotStatus.AVAILABLE]: TimeSlotStatus.AVAILABLE,
          [PrismaTimeSlotStatus.UNAVAILABLE]: TimeSlotStatus.UNAVAILABLE,
        };

        return TimeSlot.reconstitute({
          dateTime: DateTime.reconstitute({ date: formatDate, time: formatTime }),
          status: toTimeSlot[prismaTimeSlotFound.status],
        });
      }),
    });

    return schedule;
  }
}
