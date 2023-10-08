export type DoctorGatewayDTO = {
  id: string;
};

export interface DoctorGateway {
  exists(id: string): Promise<boolean>;
}
