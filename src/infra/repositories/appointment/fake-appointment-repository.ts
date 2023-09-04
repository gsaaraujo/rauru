import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';

export class FakeAppointmentRepository implements AppointmentRepository {
  public appointments: Appointment[] = [];

  public async create(appointment: Appointment): Promise<void> {
    this.appointments.push(appointment);
  }
}
