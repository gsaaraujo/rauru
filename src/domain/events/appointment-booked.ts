import { DomainEvent } from '@shared/helpers/domain-event';

export class AppointmentBooked extends DomainEvent {
  private readonly price: number;
  private readonly creditCardToken: string;

  public constructor(aggregateId: string, price: number, creditCardToken: string) {
    super(aggregateId);
    this.price = price;
    this.creditCardToken = creditCardToken;
  }
}
