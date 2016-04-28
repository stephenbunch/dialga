import {
  getMonth,
  getYear,
  getYearsBetween,
  resolveDate,
} from './util';

import MonthEngine from './MonthEngine';

export default class YearlyEngine {
  constructor(pattern) {
    this._day = pattern.day_of_month;
    this._month = pattern.month_of_year;
    this._interval = pattern.interval;
    this._engine = new MonthEngine({
      start: pattern.start_date,
      end: pattern.end_date,
      interval: pattern.interval * 12,
      resolve: year => resolveDate(year, pattern.month_of_year, pattern.day_of_month)
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
      +resolveDate(getYear(date), getMonth(date), this._day) === +date &&
      getMonth(date) === this._month &&
      getYearsBetween(this._engine.firstOccurrence, date) % this._interval === 0
    );
  }
};
