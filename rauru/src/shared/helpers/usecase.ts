import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

export abstract class Usecase<I, O> {
  public abstract execute(input?: I): Promise<Either<BaseError, O>>;
}
