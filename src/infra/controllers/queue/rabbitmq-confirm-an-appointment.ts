import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { ConfirmAnAppointmentService } from '@application/services/confirm-an-appointment-service';

import { QueueAdapter } from '@application/adapters/queue-adapter';

export class RabbitmqConfirmAnAppointmentController {
  public constructor(
    private readonly confirmAnAppointmentService: ConfirmAnAppointmentService,
    private readonly queueAdapter: QueueAdapter,
  ) {}

  public async handle(): Promise<void> {
    await this.queueAdapter.subscribe('PaymentApproved', async (dataJSON) => {
      const dataObj = JSON.parse(dataJSON);
      const confirmAnAppointmentService: Either<BaseError, void> = await this.confirmAnAppointmentService.execute({
        appointmentId: dataObj.appointmentId,
      });

      return confirmAnAppointmentService.isRight();
    });
  }
}
