import {
  dayOfWeekFromFlag,
  getDayOfWeek,
  getInstance,
  getMonthsBetween,
  resolveInstanceDate,
} from './util';

import MonthEngine from './MonthEngine';

export default class MonthNthEngine {
  constructor(pattern) {
    this._dayOfWeek = dayOfWeekFromFlag(pattern.day_of_week_mask);
    this._interval = pattern.interval;
    this._instance = pattern.instance;
    this._engine = new MonthEngine({
      start: pattern.start_date,
      end: pattern.end_date,
      interval: this._interval,
      resolve: (year, month) => resolveInstanceDate(year, month, this._instance, this._dayOfWeek)
    });
  }

  snapToOccurrence(date, direction) {
    return this._engine.snapToOccurrence(date, direction);
  }

  next(occurrence, direction) {
    return this._engine.next(occurrence, direction);
  }

  matchesInterval(date) {
    return (
      getDayOfWeek(date) === this._dayOfWeek &&
      getInstance(date) === this._instance &&
      getMonthsBetween(date, this._engine.firstOccurrence) % this._interval === 0
    );
  }
};
