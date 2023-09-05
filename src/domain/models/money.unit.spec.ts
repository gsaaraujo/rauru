import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Money } from '@domain/models/money';
import { MoneyCannotBeNegativeError } from '@domain/errors/money-cannot-be-negative-error';

describe('money', () => {
  it('should create Money', () => {
    const output: Money = Money.reconstitute({
      amount: 24.5,
    });

    const sut: Either<BaseError, Money> = Money.create({ amount: 24.5 });

    expect(sut.isRight()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should fail if amount is negative', () => {
    const output: BaseError = new MoneyCannotBeNegativeError('Money must be positive.');
    const sut: Either<BaseError, Money> = Money.create({ amount: -5 });

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });
});
