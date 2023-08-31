export abstract class ValueObject<T> {
  protected constructor(protected readonly props: T) {}

  public isEquals(valueObject: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(valueObject.props);
  }
}
