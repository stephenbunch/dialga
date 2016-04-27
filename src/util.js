import InvalidDateError from './errors/InvalidDateError';

const DATE_PATTERN = /[0-9]{4}\-[0-9]{2}\-[0-9]{2}/;

/**
 * @param {String} date
 * @returns {Date}
 */
export function getDate(date) {
  if (!DATE_PATTERN.test(date)) {
    throw new InvalidDateError('Date "' + date + '" is invalid. Expected format to be YYYY-MM-DD.');
  }
  var result = new Date(date + 'T00:00:00.000Z');
  if (isNaN(result.getTime())) {
    throw new InvalidDateError('Date "' + date + '" is invalid.');
  }
  return result;
};

/**
 * @param {String} date
 */
export function validateDate(date) {
  getDate(date);
};

/**
 * @param {Date} date
 * @returns {String}
 */
export function getString(date) {
  var month = (date.getUTCMonth() + 1).toString();
  if (month.length === 1) {
    month = '0' + month;
  }
  var day = date.getUTCDate().toString();
  if (day.length === 1) {
    day = '0' + day;
  }
  return date.getUTCFullYear() + '-' + month + '-' + day;
};

/**
 * @param {Date} date
 * @returns {Number}
 */
export function getDayOfWeek(date) {
  return date.getUTCDay();
};

/**
 * @param {Date} date
 * @returns {Number}
 */
export function getDayOfWeekFlag(date) {
  return dayOfWeekToFlag(getDayOfWeek(date));
};

/**
 * @param {Number} day
 * @returns {Number}
 */
export function dayOfWeekToFlag(day) {
  return Math.pow(2, day);
};

/**
 * @param {Date} date
 * @returns {Date}
 */
export function getSunday(date) {
  return plusDays(date, -getDayOfWeek(date));
};

/**
 * Determines whether a given bit mask contains the specified bit flag.
 * @param {Number} mask
 * @param {Number} flag
 * @returns {Boolean}
 */
export function hasFlag(mask, flag) {
  return (mask & flag) === flag;
};

/**
 * Converts a JavaScript date value to days.
 * @param {Number} value
 *   The number of milliseconds since midnight of Jan 1, 1970 UTC.
 * @returns {Number}
 */
export function durationToDays(duration) {
  return (+duration) / 1000 / 60 / 60 / 24;
};

/**
 * @param {Number} duration
 * @returns {Number}
 */
export function durationToWeeks(duration) {
  return durationToDays(duration) / 7;
};

/**
 * @param {Number} days
 * @returns {Number}
 */
export function daysToDuration(days) {
  return days * 24 * 60 * 60 * 1000;
};

/**
 * @param {Date} date
 * @param {Number} days
 * @returns {Date}
 */
export function plusDays(date, days) {
  return new Date(+date + daysToDuration(days));
};

/**
 * @param {Date} date
 * @param {Number} weeks
 * @returns {Date}
 */
export function plusWeeks(date, weeks) {
  return plusDays(date, weeks * 7);
};

/**
 * @param {Number} mask
 * @returns {Array.<Number>}
 */
export function dayOfWeekMaskToArray(mask) {
  var days = [0, 1, 2, 3, 4, 5, 6];
  var result = [];
  days.forEach(function(day) {
    if (hasFlag(mask, dayOfWeekToFlag(day))) {
      result.push(day);
    }
  });
  return result;
};

export function normalizeDirection(direction) {
  return direction < 0 ? -1 : 1;
};

export function extend(target, obj) {
  var prop;
  obj = obj || {};
  for (prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      target[prop] = obj[prop];
    }
  }
  return target;
};

export function find(array, callback) {
  var index = findIndex(array, callback);
  if (index > -1) {
    return array[index];
  } else {
    return null;
  }
};

export function findIndex(array, callback) {
  for (var i = 0; i < array.length; i++) {
    if (callback(array[i])) {
      return i;
    }
  }
  return -1;
};

export function repeat(string, times) {
  var ret = '';
  for (var i = 0; i < times; i++) {
    ret += string;
  }
  return ret;
};
