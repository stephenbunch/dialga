import DAYS from './days';
import {
  dayOfWeekMaskToArray,
  durationToWeeks,
  getDate,
  getDayOfWeekFlag,
  getSunday,
  hasFlag,
  plusDays,
  plusWeeks,
} from './util';

export default class WeeklyEngine {
  constructor(pattern) {
    this._interval = pattern.interval;
    this._dayOfWeekMask = pattern.day_of_week_mask;
    this._startDate = pattern.start_date;
    this._endDate = pattern.end_date;
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  snapToOccurrence(date, direction) {
    while (!this._doesMatchDayOfWeek(date)) {
      date = plusDays(date, direction);
    }

    let firstDay = getDate(this._startDate);
    while (!this._doesMatchDayOfWeek(firstDay)) {
      firstDay = plusDays(firstDay, 1);
    }
    if (date <= firstDay) {
      return firstDay;
    }

    if (this._endDate) {
      let lastDay = getDate(this._endDate);
      while (!this._doesMatchDayOfWeek(lastDay)) {
        lastDay = plusDays(lastDay, -1);
      }
      if (date >= lastDay) {
        return lastDay;
      }
    }

    let remainder = durationToWeeks(getSunday(date) - getSunday(firstDay)) % this._interval;
    if (remainder > 0) {
      date = plusWeeks(date, remainder * direction);
      let maskDays = dayOfWeekMaskToArray(this._dayOfWeekMask);
      if (direction > 0) {
        // Starting from Sunday, get the first valid date going forward from
        // Sunday to Saturday.
        return plusDays(getSunday(date), maskDays[0]);
      } else {
        // Starting from next Sunday, get the first valid date going backward
        // from Saturday to Sunday.
        return plusDays(getSunday(plusWeeks(date, 1)), -(7 - maskDays[maskDays.length - 1]));
      }
    } else {
      return date;
    }
  }

  /**
   * @param {Date} occurrence
   * @param {Number} direction
   * @returns {Date}
   */
  next(occurrence, direction) {
    do {
      occurrence = plusDays(occurrence, direction);
      // If it's Sunday, jump to the next valid week. If the interval is 1,
      // then we're already there.
      if (getDayOfWeekFlag(occurrence) === DAYS.Sunday) {
        occurrence = plusWeeks(occurrence, (this._interval - 1) * direction);
      }
    } while (!this._doesMatchDayOfWeek(occurrence));
    return occurrence;
  }

  /**
   * Gets a value indicating whether the date falls on the pattern interval.
   * @param {Date} date
   * @returns {Boolean}
   */
  matchesInterval(date) {
    return (
      this._doesMatchDayOfWeek(date) &&
      this._doesMatchWeeklyInterval(date)
    );
  }

  /**
   * @private
   * @param {Date} date
   * @returns {Boolean}
   */
  _doesMatchDayOfWeek(date) {
    return hasFlag(this._dayOfWeekMask, getDayOfWeekFlag(date));
  }

  /**
   * @private
   * @param {Date} date
   * @returns {Boolean}
   */
  _doesMatchWeeklyInterval(date) {
    let start = getSunday(getDate(this._startDate));
    let end = getSunday(date);
    let weeks = durationToWeeks(end - start);
    return weeks % this._interval === 0;
  }
};
