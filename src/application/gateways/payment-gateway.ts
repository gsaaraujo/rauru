export type PaymentGatewayDTO = {
  id: string;
  appointmentId: string;
};

export interface PaymentGateway {
  findOneById(id: string): Promise<PaymentGatewayDTO | null>;
}
