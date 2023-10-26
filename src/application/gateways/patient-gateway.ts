export type PatientGatewayDTO = {
  id: string;
};

export interface PatientGateway {
  exists(id: string): Promise<boolean>;
  findOneById(id: string): Promise<PatientGatewayDTO | null>;
}
