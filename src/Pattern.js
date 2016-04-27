import TYPE from './type';

import {
  durationToDays,
  find,
  findIndex,
  getDate,
  getString,
  normalizeDirection,
  plusDays,
  repeat,
  validateDate
} from './util';

import InvalidPatternError from './errors/InvalidPatternError';
import InvalidOperationError from './errors/InvalidOperationError';

import Mask from './Mask';

import DailyEngine from './DailyEngine';
import WeeklyEngine from './WeeklyEngine';
import MonthlyEngine from './MonthlyEngine';
import MonthNthEngine from './MonthNthEngine';
import YearlyEngine from './YearlyEngine';
import YearNthEngine from './YearNthEngine';

export default class Pattern {
  /**
   * @param {PatternJson} [pattern]
   */
  constructor(pattern) {
    this.value = {
      start_date: null,
      end_date: null,
      type: null,
      day_of_week_mask: null,
      day_of_month: null,
      month_of_year: null,
      interval: null,
      instance: null,
      exceptions: [],
      ...pattern
    };
    this._validated = false;
  }

  /**
   * @returns {Pattern}
   */
  validate() {
    if (this._validated) {
      return this;
    }
    this._validatePeriod();
    this._validateType();
    this._validateDayOfWeekMask();
    this._validateInterval();
    this._validateExceptions();
    this._validated = true;
    return this;
  }

  /**
   * @param {Number} interval
   * @returns {Pattern}
   */
  every(interval = 1) {
    this._validated = false;
    this.value.interval = interval;
    return this;
  }

  /**
   * @param {Number} [dayOfMonth]
   * @returns {Pattern}
   */
  day(dayOfMonth) {
    if (dayOfMonth === undefined) {
      return this.days();
    } else {
      this._validated = false;
      this.value.instance = null;
      this.value.day_of_month = dayOfMonth;
      return this;
    }
  }

  /**
   * @returns {Pattern}
   */
  days() {
    this._validated = false;
    this.value.type = TYPE.Daily;
    this.value.day_of_week_mask = null;
    this.value.instance = null;
    return this;
  }

  /**
   * @returns {Pattern}
   */
  week() {
    this._validated = false;
    this.value.type = TYPE.Weekly;
    return this;
  }

  /**
   * @returns {Pattern}
   */
  weeks() {
    return this.week();
  }

  /**
   * @returns {Pattern}
   */
  month() {
    this._validated = false;
    if (this.value.instance) {
      this.value.type = TYPE.MonthNth;
    } else {
      this.value.type = TYPE.Monthly;
      this.value.day_of_week_mask = null;
    }
    return this;
  }

  /**
   * @returns {Pattern}
   */
  months() {
    return this.month();
  }

  /**
   * @returns {Pattern}
   */
  year() {
    this._validated = false;
    if (this.value.instance) {
      this.value.type = TYPE.YearNth;
    } else {
      this.value.type = TYPE.Yearly;
      this.value.day_of_week_mask = null;
    }
    return this;
  }

  /**
   * @returns {Pattern}
   */
  years() {
    return this.year();
  }

  /**
   * @param {Number} dayOfWeekMask
   * @returns {Pattern}
   */
  on(dayOfWeekMask) {
    this._validated = false;
    this.value.day_of_week_mask = dayOfWeekMask;
    this.value.instance = null;
    return this;
  }

  /**
   * @param {Number} instance
   * @param {Number} dayOfWeek
   * @returns {Pattern}
   */
  the(instance, dayOfWeek) {
    this._validated = false;
    this.value.instance = instance;
    this.value.day_of_week_mask = dayOfWeek;
    return this;
  }

  /**
   * @param {String} date
   * @returns {Pattern}
   */
  from(date) {
    this._validated = false;
    this.value.start_date = date;
    return this;
  }

  /**
   * @param {String} date
   * @returns {Pattern}
   */
  to(date) {
    this._validated = false;
    this.value.end_date = date;
    return this;
  }

  /**
   * @param {String} date
   * @param {String} newDate
   * @returns {Pattern}
   */
  addException(date, newDate) {
    this._validated = false;
    let exception = find(this.value.exceptions, function(exception) {
      return exception.original_date === date;
    });
    if (!exception) {
      exception = {};
      this.value.exceptions.push(exception);
    }
    exception.original_date = date;
    exception.date = newDate;
    return this;
  }

  /**
   * @param {String} date
   * @returns {Pattern}
   */
  removeException(date) {
    this._validated = false;
    let index = findIndex(this.value.exceptions, function(exception) {
      return exception.original_date === date;
    });
    if (index > -1) {
      this.value.exceptions.splice(index, 1);
    }
    return this;
  }

  /**
   * @returns {Pattern}
   */
  removeAllExceptions() {
    this._validated = false;
    this.value.exceptions = [];
    return this;
  }

  /**
   * @param {String} date
   * @returns {Pattern}
   */
  findException(date) {
    return find(this.value.exceptions, function(exception) {
      return exception.original_date === date;
    });
  }

  /**
   * Determines whether the specified date occurs in the recurrence pattern.
   * @param {String} date
   * @returns {Boolean}
   */
  matches(date) {
    this.validate();
    if (this._exceptionsByDate[date]) {
      return true;
    }
    if (this._moved[date]) {
      return false;
    }
    if (!this._doesOccurWithinPeriod(date)) {
      return false;
    }
    return this._engine.matchesInterval(getDate(date));
  }

  /**
   * Gets the recurrence pattern as a plain old JSON object.
   * @returns {PatternJson}
   */
  toJSON() {
    return this.value;
  }

  /**
   * @param {String} [end]
   * @returns {Mask}
   */
  toMask(end) {
    end = end || this.value.end_date;
    if (!end) {
      throw new InvalidOperationError('An end date is required to generate a mask.');
    }
    let mask = '';
    let last, next;
    while (next = this.next(last)) {
      if (next > end) {
        break;
      }
      let days = durationToDays(getDate(next) - getDate(last || this.value.start_date));
      if (last) {
        days -= 1;
      }
      mask += repeat('0', days);
      mask += '1';
      last = next;
    }
    if (mask) {
      return new Mask(Mask.trim(this.value.start_date + '|' + mask));
    } else {
      return new Mask();
    }
  };

  /**
   * Gets the next occurrence or exception in the recurrence pattern after the
   * specified date or returns false if there are no more occurrences.
   * @param {String} [start] The date to search from.
   * @param {Number} [direction]
   *   A value indicating direction. Positive goes forward, negative goes backward.
   * @returns {String|Boolean}
   */
  next(start, direction) {
    this.validate();
    if (typeof start !== "string") {
      direction = start;
      start = getString(plusDays(getDate(this.value.start_date), -1));
    }
    let date = start;
    while (true) {
      date = getString(this._getNextOccurrence(getDate(date), normalizeDirection(direction)));
      if (this._doesOccurWithinPeriod(date)) {
        // See if there's an exception for this date.
        let exception = this._exceptionsByOriginalDate[date];
        if (exception) {
          if (exception.date) {
            return date;
          } else {
            // This occurence was deleted. Get the next one.
          }
        } else {
          return date;
        }
      } else {
        // We're outside the range of the recurrence pattern.
        return false;
      }
    }
  }

  /**
   * Gets the next date in the recurrence pattern after the specified date
   * or returns false if there are no more occurrences.
   * @param {String} start The date to search from.
   * @param {Number} [direction]
   *   A value indicating direction. Positive goes forward, negative goes backward.
   * @returns {String|Boolean}
   */
  nextPatternDate(start, direction) {
    this.validate();
    let date = getString(this._getNextOccurrence(getDate(start), normalizeDirection(direction)));
    if (this._doesOccurWithinPeriod(date)) {
      return date;
    } else {
      return false;
    }
  }

  /**
   * Gets the next occurrence, or returns the specified date if it's valid.
   * @param {String} date
   * @param {Number} [direction]
   *   A value indicating direction. Positive goes forward, negative goes backward.
   * @returns {String|Boolean}
   */
  snap(date, direction) {
    this.validate();
    return getString(this._snapToOccurrence(getDate(date), normalizeDirection(direction)));
  }

  _validatePeriod() {
    if (!this.value.start_date) {
      throw new InvalidPatternError('A start date is required.');
    }
    this.value.start_date = String(this.value.start_date);
    validateDate(this.value.start_date);
    if (this.value.end_date) {
      this.value.end_date = String(this.value.end_date);
      validateDate(this.value.end_date);
      if (this.value.start_date > this.value.end_date) {
        throw new InvalidPatternError('The end date must be greater than or equal to the start date');
      }
    }
  }

  _validateType() {
    if (!this.value.type) {
      throw new InvalidPatternError('A recurrence type is required.');
    }
    this.value.type = Number(this.value.type);
    switch (this.value.type) {
      case TYPE.Daily:
        this._engine = new DailyEngine(this.value);
        break;
      case TYPE.Weekly:
        this._engine = new WeeklyEngine(this.value);
        break;
      case TYPE.Monthly:
        this._engine = new MonthlyEngine(this.value);
        break;
      case TYPE.MonthNth:
        this._engine = new MonthNthEngine(this.value);
        break;
      case TYPE.Yearly:
        this._engine = new YearlyEngine(this.value);
        break;
      case TYPE.YearNth:
        this._engine = new YearNthEngine(this.value);
        break;
      default:
        throw new InvalidPatternError('The recurrence type "' + this.value.type + '" is invalid.');
    }
  }

  _validateDayOfWeekMask() {
    if (this.value.type === TYPE.Weekly) {
      if (!this.value.day_of_week_mask) {
        throw new InvalidPatternError('A day-of-week mask is required for weekly recurrence patterns.');
      }
    } else {
      this.value.day_of_week_mask = null;
    }
  }

  _validateInterval() {
    if (!this.value.interval) {
      throw new InvalidPatternError('A recurrence interval is required.');
    }
    this.value.interval = Number(this.value.interval);
    if (isNaN(this.value.interval) || this.value.interval <= 0) {
      throw new InvalidPatternError('The recurrence interval must be a number greater than 0.');
    }
  }

  _validateExceptions() {
    this._exceptionsByDate = {};
    this._exceptionsByOriginalDate = {};
    this._moved = {};
    this.value.exceptions = this.value.exceptions || [];

    this._validated = true;
    let exceptions = {};
    try {
      this.value.exceptions.forEach(exception => {
        if (!this.matches(exception.original_date)) {
          throw new InvalidPatternError('An exception exists for an invalid date "' + exception.original_date + '".');
        }
        if (exceptions[exception.original_date]) {
          throw new InvalidPatternError('More than one exception exists for "' + exception.original_date + '".');
        }
        if (exception.date) {
          if (
            exception.date < this.value.start_date ||
            !!this.value.end_date && exception.date > this.value.end_date
          ) {
            throw new InvalidPatternError('The exception for "' + exception.original_date + '" is outside the pattern period.');
          }
          if (exception.date !== exception.original_date && this.matches(exception.date)) {
            throw new InvalidPatternError('The exception for "' + exception.original_date + '" cannot occur on the same date as a regular occurrence."');
          }
          if (exceptions[exception.original_date]) {
            throw new InvalidPatternError('More than one exception exists for "' + exception.original_date + '".');
          }
          if (exception.date <= this.nextPatternDate(exception.original_date, -1)) {
            throw new InvalidPatternError('The exception for "' + exception.original_date + '" must occur after the previous occurrence.');
          }
          if (exception.date >= this.nextPatternDate(exception.original_date, 1)) {
            throw new InvalidPatternError('The exception for "' + exception.original_date + '" must occur before the next occurrence.');
          }
        }
        exceptions[exception.original_date] = true;
      });
    } finally {
      this._validated = false;
    }

    this.value.exceptions.forEach(exception => {
      this._exceptionsByOriginalDate[exception.original_date] = exception;
      if (exception.original_date !== exception.date) {
        this._moved[exception.original_date] = true;
      }
      if (exception.date) {
        this._exceptionsByDate[exception.date] = exception;
      }
    });
  }

  /**
   * @private
   * @param {String} date
   * @returns {Boolean}
   */
  _doesOccurWithinPeriod(date) {
    return (
      date >= this.value.start_date &&
      (!this.value.end_date || date <= this.value.end_date)
    );
  }

  /**
   * Gets the next valid occurrence starting from the specified date. A negative
   * direction gets the previous occurrence rather than the next.
   * @private
   * @param {Date} start The date to start from.
   * @param {Number} direction Must be 1 or -1.
   * @returns {Date}
   */
  _getNextOccurrence(start, direction) {
    let occurrence = this._snapToOccurrence(start, direction);
    if (+occurrence !== +start) {
      return occurrence;
    }
    return this._engine.next(occurrence, direction);
  }

  /**
   * Gets the nearest valid occurrence to the specified date. If occurrences
   * exist before and after the date, a positive direction returns the later
   * occurrence whereas a negative direction returns the earlier occurrence.
   * @private
   * @param {Date} date The date to snap to.
   * @param {Number} direction Must be 1 or -1.
   * @returns {Date}
   */
  _snapToOccurrence(date, direction) {
    return this._engine.snapToOccurrence(date, direction);
  }
};

[
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'
].forEach(function(month, index) {
  Pattern.prototype[month.toLowerCase()] = function(dayOfMonth) {
    this._validated = false;
    this.value.month_of_year = index + 1;
    this.value.day_of_month = dayOfMonth;
    this.value.instance = null;
    return this;
  };

  Pattern.prototype['of' + month] = function(dayOfMonth) {
    this._validated = false;
    this.value.month_of_year = index + 1;
    this.value.day_of_month = dayOfMonth;
    return this;
  };
});
