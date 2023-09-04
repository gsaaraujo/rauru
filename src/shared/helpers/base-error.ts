export abstract class BaseError {
  public constructor(private readonly _message: string) {}

  get message(): string {
    return this._message;
  }
}
