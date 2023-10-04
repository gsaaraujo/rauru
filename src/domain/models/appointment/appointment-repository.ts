import { Appointment } from '@domain/models/appointment/appointment';

export interface AppointmentRepository {
  create(appointment: Appointment): Promise<void>;
  update(appointment: Appointment): Promise<void>;
  findOneById(id: string): Promise<Appointment | null>;
  isTimeSlotBookedAlready(timeSlot: Date): Promise<boolean>;
}
