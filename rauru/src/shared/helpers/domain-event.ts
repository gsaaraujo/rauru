export abstract class DomainEvent {
  private readonly _aggregateId: string;
  private readonly _dateTimeOccurred: Date;

  public constructor(aggregateId: string) {
    this._aggregateId = aggregateId;
    this._dateTimeOccurred = new Date();
  }

  get aggregateId(): string {
    return this._aggregateId;
  }

  get dateTimeOccurred(): Date {
    return this._dateTimeOccurred;
  }
}
