export abstract class DomainEvent {
  private readonly aggregateId: string;
  private readonly dateTimeOccurred: Date;

  public constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
    this.dateTimeOccurred = new Date();
  }

  get getAggregateId(): string {
    return this.aggregateId;
  }

  get getDateTimeOccurred(): Date {
    return this.dateTimeOccurred;
  }
}
