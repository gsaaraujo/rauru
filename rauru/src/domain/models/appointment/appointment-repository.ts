import { Appointment } from '@domain/models/appointment/appointment';

export interface AppointmentRepository {
  create(appointment: Appointment): Promise<void>;
}
