import { BaseError } from '@shared/helpers/base-error';
import { ValueObject } from '@shared/helpers/value-object';
import { Either, left, right } from '@shared/helpers/either';

import { MoneyCannotBeNegativeError } from '@domain/errors/money-cannot-be-negative-error';

export type MoneyProps = {
  amount: number;
};

export class Money extends ValueObject<MoneyProps> {
  public static create(props: MoneyProps): Either<BaseError, Money> {
    if (props.amount < 0) {
      const error = new MoneyCannotBeNegativeError('Money must be positive.');
      return left(error);
    }

    const money = new Money(props);
    return right(money);
  }

  public static reconstitute(props: MoneyProps): Money {
    return new Money(props);
  }

  get amount(): number {
    return this.props.amount;
  }
}
