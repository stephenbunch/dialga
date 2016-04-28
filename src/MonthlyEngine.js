import {
  getMonth,
  getMonthsBetween,
  getYear,
  resolveDate,
} from './util';

import MonthEngine from './MonthEngine';

export default class MonthlyEngine {
  constructor(pattern) {
    this._interval = pattern.interval;
    this._day = pattern.day_of_month;
    this._engine = new MonthEngine({
      start: pattern.start_date,
      end: pattern.end_date,
      interval: pattern.interval,
      resolve: (year, month) => resolveDate(year, month, pattern.day_of_month)
    });
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  snapToOccurrence(date, direction) {
    return this._engine.snapToOccurrence(date, direction);
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  next(occurrence, direction) {
    return this._engine.next(occurrence, direction);
  }

  /**
   * Gets a value indicating whether the date falls on the pattern interval.
   * @param {Date} date
   * @returns {Date}
   */
  matchesInterval(date) {
    return (
      +resolveDate(getYear(date), getMonth(date), this._day) === +date &&
      getMonthsBetween(this._engine.firstOccurrence, date) % this._interval === 0
    );
  }
};
