import { Schedule } from '@domain/models/schedule/schedule';
import { ScheduleRepository } from '@domain/models/schedule/schedule-repository';

export class FakeScheduleRepository implements ScheduleRepository {
  public schedules: Schedule[] = [];

  async findOneByDoctorId(id: string): Promise<Schedule> {
    const scheduleFound: Schedule | undefined = this.schedules.find((schedule) => schedule.doctorId === id);
    return scheduleFound as Schedule;
  }
}
