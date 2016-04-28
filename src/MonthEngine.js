import {
  getDate,
  getMonth,
  getMonthsBetween,
  getYear,
} from './util';

export default class MonthEngine {
  constructor({ start, end, interval, resolve }) {
    this._interval = interval;
    this._resolve = resolve;

    let patternStart = getDate(start);
    let year = getYear(patternStart);
    let month = getMonth(patternStart);
    let firstOccurrence = this._resolveDate(year, month);
    if (firstOccurrence < patternStart) {
      firstOccurrence = this._resolveDate(year, month + 1);
    }
    this.firstOccurrence = firstOccurrence;

    if (end) {
      this.lastOccurrence = this._getOccurrenceUntil(getDate(end));
    } else {
      this.lastOccurrence = null;
    }
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  snapToOccurrence(date, direction) {
    let occurrence = this._getOccurrenceUntil(date);
    if (occurrence < date && direction > 0) {
      occurrence = this._resolveDate(getYear(occurrence), getMonth(occurrence) + this._interval);
    } else if (occurrence > date && direction < 0) {
      occurrence = this._resolveDate(getYear(occurrence), getMonth(occurrence) - this._interval);
    }
    if (occurrence < this.firstOccurrence) {
      occurrence = this.firstOccurrence;
    } else if (this.lastOccurrence && occurrence > this.lastOccurrence) {
      occurrence = this.lastOccurrence;
    }
    return occurrence;
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  next(occurrence, direction) {
    return this._resolveDate(getYear(occurrence), getMonth(occurrence) + (this._interval * direction));
  }

  /**
   * @param {Date} date
   * @returns {Date}
   */
  _getOccurrenceUntil(date) {
    if (date < this.firstOccurrence) {
      date = this.firstOccurrence;
    }
    let months = Math.floor(getMonthsBetween(this.firstOccurrence, date) / this._interval) * this._interval;
    let occurrence = this._resolveDate(getYear(this.firstOccurrence), getMonth(this.firstOccurrence) + months);
    if (occurrence > date) {
      occurrence = this._resolveDate(getYear(occurrence), getMonth(occurrence) - this._interval);
    }
    if (occurrence < this.firstOccurrence) {
      occurrence = this.firstOccurrence;
    }
    return occurrence;
  }

  /**
   * @param {Number} year
   * @param {Number} month
   * @returns {Date}
   */
  _resolveDate(year, month) {
    if (month > 12) {
      year += Math.floor(month / 12);
      month -= Math.floor(month / 12) * 12;
    } else if (month < 1) {
      year -= Math.ceil((month - 1) * -1 / 12);
      month += Math.ceil((month - 1) * -1 / 12) * 12;
    }
    return this._resolve(year, month);
  }
};
