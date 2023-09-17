import { BaseError } from '@shared/helpers/base-error';
import { Either, right } from '@shared/helpers/either';
import { ValueObject } from '@shared/helpers/value-object';

export type DateTimeProps = {
  date: string;
  time: string;
};

export class DateTime extends ValueObject<DateTimeProps> {
  public static create(props: DateTimeProps): Either<BaseError, DateTime> {
    const dateTime = new DateTime(props);
    return right(dateTime);
  }

  public static reconstitute(props: DateTimeProps): DateTime {
    return new DateTime(props);
  }

  get dateTime(): Date {
    const day = Number(this.props.date.split('/')[0]);
    const month = Number(this.props.date.split('/')[1]) - 1;
    const year = Number(this.props.date.split('/')[2]);
    const hour = Number(this.props.time.split(':')[0]);
    const minute = Number(this.props.time.split(':')[1]);
    return new Date(year, month, day, hour, minute);
  }

  get date(): string {
    return this.props.date;
  }

  get time(): string {
    return this.props.time;
  }
}
