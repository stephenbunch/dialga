import {
  getDate,
  getMonth,
  getMonthsBetween,
  getYear,
  resolveDate,
} from './util';

export default class MonthlyEngine {
  constructor(pattern) {
    this._interval = pattern.interval;
    this._day = pattern.day_of_month;

    let patternStart = getDate(pattern.start_date);
    let year0 = getYear(patternStart);
    let month0 = getMonth(patternStart);
    let firstOccurrence = resolveDate(year0, month0, pattern.day_of_month);
    if (firstOccurrence < patternStart) {
      firstOccurrence = resolveDate(year0, month0 + 1, pattern.day_of_month);
    }
    this._firstOccurrence = firstOccurrence;

    if (pattern.end_date) {
      this._lastOccurrence = this._getOccurrenceUntil(getDate(pattern.end_date));
    } else {
      this._lastOccurrence = null;
    }
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  snapToOccurrence(date, direction) {
    if (date < this._firstOccurrence) {
      return this._firstOccurrence;
    } else if (this._lastOccurrence && date > this._lastOccurrence) {
      return this._lastOccurrence;
    }

    let occurrence = this._getOccurrenceUntil(date);
    if (occurrence < date && direction > 0) {
      occurrence = resolveDate(getYear(occurrence), getMonth(occurrence) + this._interval, this._day);
    } else if (occurrence > date && direction < 0) {
      occurrence = resolveDate(getYear(occurrence), getMonth(occurrence) - this._interval, this._day);
    }
    if (occurrence < this._firstOccurrence) {
      occurrence = this._firstOccurrence;
    } else if (this._lastOccurrence && occurrence > this._lastOccurrence) {
      occurrence = this._lastOccurrence;
    }
    return occurrence;
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  next(occurrence, direction) {
    return resolveDate(
      getYear(occurrence),
      getMonth(occurrence) + (this._interval * direction),
      this._day
    );
  }

  /**
   * Gets a value indicating whether the date falls on the pattern interval.
   * @param {Date} date
   * @returns {Date}
   */
  matchesInterval(date) {
    return (
      +resolveDate(getYear(date), getMonth(date), this._day) === +date &&
      getMonthsBetween(this._firstOccurrence, date) % this._interval === 0
    );
  }

  /**
   * Gets the occurrence on or immediately before the specified date.
   * @param {Date} date
   * @returns {Date}
   */
  _getOccurrenceUntil(date) {
    let months = Math.floor(getMonthsBetween(this._firstOccurrence, date) / this._interval) * this._interval;
    let occurrence = resolveDate(getYear(this._firstOccurrence), getMonth(this._firstOccurrence) + months, this._day);
    if (occurrence > date) {
      occurrence = resolveDate(getYear(occurrence), getMonth(occurrence) - this._interval, this._day);
    }
    if (occurrence < this._firstOccurrence) {
      occurrence = this._firstOccurrence;
    }
    return occurrence;
  }
};
