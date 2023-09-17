export abstract class BaseError {
  public constructor(private readonly _message: string) {
    console.error(_message);
  }

  get message(): string {
    return this._message;
  }
}
