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

  public async isTimeSlotBookedAlready(timeSlot: Date): Promise<boolean> {
    for (const appointment of this.appointments) {
      if (appointment.date === timeSlot) return true;
    }

    return false;
  }
}
