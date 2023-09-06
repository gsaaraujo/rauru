import { Appointment } from '@domain/models/appointment/appointment';
import { AppointmentRepository } from '@domain/models/appointment/appointment-repository';

export class FakeAppointmentRepository implements AppointmentRepository {
  public appointments: Appointment[] = [];

  public async create(appointment: Appointment): Promise<void> {
    this.appointments.push(appointment);
  }

  public async findOneById(id: string): Promise<Appointment | null> {
    const appointmentFound: Appointment | undefined = this.appointments.find((appointment) => appointment.id === id);
    return appointmentFound ?? null;
  }
}
