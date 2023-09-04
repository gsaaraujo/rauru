import { Schedule } from '@domain/models/schedule/schedule';

export interface ScheduleRepository {
  findOneByDoctorId(id: string): Promise<Schedule | null>;
}
