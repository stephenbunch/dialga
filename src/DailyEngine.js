import {
  durationToDays,
  getDate,
  plusDays,
} from './util';

export default class DailyEngine {
  constructor(pattern) {
    this._interval = pattern.interval;
    this._startDate = pattern.start_date;
    this._firstOccurrence = getDate(pattern.start_date);
    this._lastOccurrence = pattern.end_date ? getDate(pattern.end_date) : null;
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  snapToOccurrence(date, direction) {
    let remainder = durationToDays(date - this._firstOccurrence) % this._interval;
    let occurrence = plusDays(date, remainder * direction);
    if (occurrence < this._firstOccurrence) {
      occurrence = this._firstOccurrence;
    }
    if (this._lastOccurrence && occurrence > this._lastOccurrence) {
      occurrence = this._lastOccurrence;
    }
    return occurrence;
  }

  /**
   * @param {Date} occurrence
   * @param {Number} direction
   * @returns {Date}
   */
  next(occurrence, direction) {
    return plusDays(occurrence, this._interval * direction);
  }

  /**
   * Gets a value indicating whether the date falls on the pattern interval.
   * @param {Date} date
   * @returns {Boolean}
   */
  matchesInterval(date) {
    let days = durationToDays(date - getDate(this._startDate));
    return days % this._interval === 0;
  }
};
