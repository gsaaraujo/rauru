import { ConfirmAnAppointment } from '@domain/usecases/confirm-an-appointment';

import { QueueAdapter } from '@infra/adapters/queue/queue-adapter';

export class RabbitmqConfirmAnAppointmentController {
  public constructor(
    private readonly confirmAnAppointment: ConfirmAnAppointment,
    private readonly queueAdapter: QueueAdapter,
  ) {}

  public async handle(): Promise<void> {
    await this.queueAdapter.subscribe('PaymentApproved', async (dataJSON) => {
      const dataObj = JSON.parse(dataJSON);
      await this.confirmAnAppointment.execute({ appointmentId: dataObj.appointmentId });
    });
  }
}
