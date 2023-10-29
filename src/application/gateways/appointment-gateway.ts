export type AppointmentDTO = {
  id: string;
  date: Date;
  doctorId: string;
  patientId: string;
  price: number;
  status: string;
};

export interface AppointmentGateway {
  existsById(id: string): Promise<boolean>;
  findOneById(id: string): Promise<AppointmentDTO | null>;
  findAllByDoctorId(doctorId: string): Promise<AppointmentDTO[]>;
}
