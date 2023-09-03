export type PatientGatewayDTO = {
  id: string;
};

export interface PatientGateway {
  exists(id: string): Promise<boolean>;
}
