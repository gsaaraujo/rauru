import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { QueueAdapter } from '@application/adapters/queue-adapter';
import { PaymentGateway, PaymentGatewayDTO } from '@application/gateways/payment-gateway';
import { ConfirmAnAppointmentService } from '@application/services/confirm-an-appointment-service';

export class RabbitmqConfirmAnAppointmentController {
  public constructor(
    private readonly confirmAnAppointmentService: ConfirmAnAppointmentService,
    private readonly paymentGateway: PaymentGateway,
    private readonly queueAdapter: QueueAdapter,
  ) {}

  public async handle(): Promise<void> {
    await this.queueAdapter.subscribe('PaymentProcessed', async (rawData) => {
      try {
        const data = JSON.parse(rawData);

        if (data.paymentId === undefined) {
          return false;
        }

        const paymentGatewayDTO: PaymentGatewayDTO | null = await this.paymentGateway.findOneById(data.paymentId);

        if (paymentGatewayDTO === null) {
          return false;
        }

        const confirmAnAppointmentService: Either<BaseError, void> = await this.confirmAnAppointmentService.execute({
          appointmentId: paymentGatewayDTO.appointmentId,
        });

        return confirmAnAppointmentService.isRight();
      } catch (error) {
        return false;
      }
    });
  }
}
