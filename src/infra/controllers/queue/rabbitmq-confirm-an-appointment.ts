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
      await this.confirmAnAppointmentService.execute({ appointmentId: dataObj.appointmentId });
    });
  }
}
