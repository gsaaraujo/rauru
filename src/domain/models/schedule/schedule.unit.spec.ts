import { describe, expect, it } from 'vitest';

import { Either } from '@shared/helpers/either';
import { BaseError } from '@shared/helpers/base-error';

import { Money } from '@domain/models/money';
import { DaysOfAvailability, Schedule } from '@domain/models/schedule/schedule';
import { TimeSlotNotFoundError } from '@domain/errors/time-slot-not-found-error';
import { TimeSlotAlreadyAddedError } from '@domain/errors/time-slot-already-added-error';
import { DaysOfAvailabilityNotFoundError } from '@domain/errors/days-of-availability-not-found-error';
import { DayOfAvailabilityAlreadyAddedError } from '@domain/errors/day-of-availability-already-added-error';

describe('schedule', () => {
  it('should create Schedule', () => {
    const output: Schedule = Schedule.reconstitute('any', {
      doctorId: 'any',
      price: Money.reconstitute({ amount: 120 }),
      timeSlots: [],
      daysOfAvailability: [],
    });

    const sut: Either<BaseError, Schedule> = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    });

    expect(sut.isRight()).toBeTruthy();
    expect((sut.value as Schedule).price).toStrictEqual(output.price);
    expect((sut.value as Schedule).doctorId).toStrictEqual(output.doctorId);
    expect((sut.value as Schedule).timeSlots).toStrictEqual(output.timeSlots);
  });

  it('should add a time slot', () => {
    const sut: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    sut.addTimeSlot('10:00');
    sut.addTimeSlot('16:00');

    expect(sut.timeSlots).toHaveLength(2);
  });

  it('should fail when trying to add a time slot that has already been added', () => {
    const output = new TimeSlotAlreadyAddedError('This time slot has already been added.');

    const schedule: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    schedule.addTimeSlot('10:00');
    const sut: Either<BaseError, void> = schedule.addTimeSlot('10:00');

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should remove a time slot', () => {
    const sut: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    sut.addTimeSlot('10:00');
    sut.removeTimeSlot('10:00');

    expect(sut.timeSlots).toHaveLength(0);
  });

  it('should fail when trying to remove a time slot that has not been added yet', () => {
    const output = new TimeSlotNotFoundError('The doctor has not defined a time slot for this date.');

    const schedule: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    const sut: Either<BaseError, void> = schedule.removeTimeSlot(`d8e8496d-680d-499c-a39e-689674cb3b28`);

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should add a day of availability', () => {
    const sut: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    sut.addDayOfAvailability(DaysOfAvailability.MONDAY);
    sut.addDayOfAvailability(DaysOfAvailability.THURSDAY);

    expect(sut.daysOfAvailability).toHaveLength(2);
  });

  it('should fail when adding a day of availability already added', () => {
    const output = new DayOfAvailabilityAlreadyAddedError('This day has already been added.');

    const schedule: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    schedule.addDayOfAvailability(DaysOfAvailability.MONDAY);
    const sut: Either<BaseError, void> = schedule.addDayOfAvailability(DaysOfAvailability.MONDAY);

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should remove a day of availability', () => {
    const sut: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    sut.addDayOfAvailability(DaysOfAvailability.MONDAY);
    sut.removeDayOfAvailability(DaysOfAvailability.MONDAY);

    expect(sut.daysOfAvailability).toHaveLength(0);
  });

  it('should fail when trying to remove a day of availability that has not been added yet', () => {
    const output = new DaysOfAvailabilityNotFoundError('The doctor has not added this day as available.');

    const schedule: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    const sut: Either<BaseError, void> = schedule.removeDayOfAvailability(DaysOfAvailability.WEDNESDAY);

    expect(sut.isLeft()).toBeTruthy();
    expect(sut.value).toStrictEqual(output);
  });

  it('should return true if schedule has a specific time slot and doctor is available for that day of the week', () => {
    const schedule: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    schedule.addTimeSlot('10:00');
    schedule.addDayOfAvailability(DaysOfAvailability.WEDNESDAY);

    const sut: boolean = schedule.hasTimeSlot(new Date('2023-09-27T10:00:00.000Z'));

    expect(sut).toBeTruthy();
  });

  it('should return false if schedule has a specific time slot but doctor is not available for that day of the week', () => {
    const schedule: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    schedule.addTimeSlot('10:00');
    const sut: boolean = schedule.hasTimeSlot(new Date('2023-09-27T10:00:00.000Z'));

    expect(sut).toBeFalsy();
  });

  it('should return false if schedule has not the specific time slot but doctor is available for that day of the week', () => {
    const schedule: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    schedule.addDayOfAvailability(DaysOfAvailability.WEDNESDAY);
    const sut: boolean = schedule.hasTimeSlot(new Date('2023-09-27T10:00:00.000Z'));

    expect(sut).toBeFalsy();
  });

  it('should return false if schedule either has not a specific time slot and doctor is not available for that day of the week', () => {
    const schedule: Schedule = Schedule.create({
      doctorId: 'any',
      price: Money.create({ amount: 120 }).value as Money,
    }).value as Schedule;

    const sut: boolean = schedule.hasTimeSlot(new Date('2023-09-27T10:00:00.000Z'));

    expect(sut).toBeFalsy();
  });
});
