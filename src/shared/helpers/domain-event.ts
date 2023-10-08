export abstract class DomainEvent {
  public readonly aggregateId: string;
  public readonly dateTimeOccurred: Date;

  public constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
    this.dateTimeOccurred = new Date();
  }
}
