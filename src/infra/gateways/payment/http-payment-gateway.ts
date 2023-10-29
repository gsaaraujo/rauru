import { HttpAdapter } from '@infra/adapters/http/http-adapter';

import { PaymentGateway, PaymentGatewayDTO } from '@application/gateways/payment-gateway';

type Payment = {
  id: string;
  appointmentId: string;
};

type Error = {
  error: string;
};

export class HttpPaymentGateway implements PaymentGateway {
  public constructor(private readonly httpAdapter: HttpAdapter) {}

  async findOneById(id: string): Promise<PaymentGatewayDTO | null> {
    const payment: Payment | Error = await this.httpAdapter.get<Payment | Error>(
      `http://localhost:3001/payments/${id}`,
    );

    if ('error' in payment) {
      return null;
    }

    return {
      id: payment.id,
      appointmentId: payment.appointmentId,
    };
  }
}
