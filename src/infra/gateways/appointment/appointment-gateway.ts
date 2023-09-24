export type AppointmentDTO = {
  id: string;
  date: Date;
  doctorId: string;
  patientId: string;
  price: number;
  status: string;
};

export interface AppointmentGateway {
  findAllByDoctorId(doctorId: string): Promise<AppointmentDTO[]>;
}
