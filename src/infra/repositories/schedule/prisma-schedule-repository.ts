import {
  PrismaClient,
  Schedule as PrismaSchedule,
  DaysOfAvailability as PrismaDaysOfAvailability,
} from '@prisma/client';

import { Money } from '@domain/models/money';
import { DaysOfAvailability, Schedule } from '@domain/models/schedule/schedule';
import { ScheduleRepository } from '@domain/models/schedule/schedule-repository';

export class PrismaScheduleRepository implements ScheduleRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findOneByDoctorId(id: string): Promise<Schedule | null> {
    const prismaScheduleFound: PrismaSchedule | null = await this.prisma.schedule.findFirst({
      where: { doctorId: id },
    });

    if (!prismaScheduleFound) return null;

    const daysOfAvailability = {
      [PrismaDaysOfAvailability.MONDAY]: DaysOfAvailability.MONDAY,
      [PrismaDaysOfAvailability.TUESDAY]: DaysOfAvailability.TUESDAY,
      [PrismaDaysOfAvailability.WEDNESDAY]: DaysOfAvailability.WEDNESDAY,
      [PrismaDaysOfAvailability.THURSDAY]: DaysOfAvailability.THURSDAY,
      [PrismaDaysOfAvailability.FRIDAY]: DaysOfAvailability.FRIDAY,
      [PrismaDaysOfAvailability.SATURDAY]: DaysOfAvailability.SATURDAY,
      [PrismaDaysOfAvailability.SUNDAY]: DaysOfAvailability.SUNDAY,
    };

    const schedule: Schedule = Schedule.reconstitute(prismaScheduleFound.id, {
      doctorId: prismaScheduleFound.doctorId,
      price: Money.reconstitute({ amount: prismaScheduleFound.price }),
      timeSlots: prismaScheduleFound.timeSlots,
      daysOfAvailability: prismaScheduleFound.daysOfAvailability.map(
        (dayOfAvailability) => daysOfAvailability[dayOfAvailability],
      ),
    });

    return schedule;
  }
}
