import {
  dayOfWeekFromFlag,
  getDayOfWeek,
  getInstance,
  getMonth,
  getYearsBetween,
  resolveInstanceDate,
} from './util';

import MonthEngine from './MonthEngine';

export default class YearNthEngine {
  constructor(pattern) {
    this._dayOfWeek = dayOfWeekFromFlag(pattern.day_of_week_mask);
    this._instance = pattern.instance;
    this._interval = pattern.interval;
    this._month = pattern.month_of_year;
    this._engine = new MonthEngine({
      start: pattern.start_date,
      end: pattern.end_date,
      interval: pattern.interval * 12,
      resolve: year => resolveInstanceDate(year, pattern.month_of_year, pattern.instance, this._dayOfWeek)
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
      getMonth(date) === this._month &&
      getYearsBetween(date, this._engine.firstOccurrence) % this._interval === 0
    );
  }
};
