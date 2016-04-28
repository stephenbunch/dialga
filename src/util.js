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
  let result = new Date(date + 'T00:00:00.000Z');
  if (isNaN(result.getTime())) {
    throw new InvalidDateError('Date "' + date + '" is invalid.');
  }
  return result;
};

/**
 * Creates a date object from the specified year/month/day.
 * @param {Number} year
 * @param {Number} month
 * @param {Number} day
 * @returns {Date}
 */
export function getDateFromParts(year, month, day) {
  return getDate(`${year}-${padZero(month)}-${padZero(day)}`);
};

/**
 * Creates a date object from the specified year/month/day. If day is too high,
 * the last day of the month is used.
 * @param {Number} year
 * @param {Number} month [1-12]
 * @param {Number} day [1-31]
 * @returns {Date}
 */
export function resolveDate(year, month, day) {
  let daysInMonth = getDaysInMonth(getDateFromParts(year, month, 1));
  return getDateFromParts(year, month, Math.min(day, daysInMonth));
};

export function getInstance(date) {
  return Math.ceil(getDayOfMonth(date) / 7);
};

/**
 * @param {Number} year
 * @param {Number} month
 * @param {Number} instance [1-5]
 * @param {Number} dayOfWeek [0-6]
 * @returns {Date}
 */
export function resolveInstanceDate(year, month, instance, dayOfWeek) {
  let day0 = getDateFromParts(year, month, 1);
  let dow0 = getDayOfWeek(day0);
  if (dayOfWeek < dow0) {
    dayOfWeek += 7;
  }
  let firstInstance = 1 + dayOfWeek - dow0;
  let day = firstInstance + (instance - 1) * 7;
  let daysInMonth = getDaysInMonth(day0);
  if (day > daysInMonth) {
    day -= 7;
  }
  return getDateFromParts(year, month, day);
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
  let month = padZero(getMonth(date));
  let day = padZero(getDayOfMonth(date));
  return date.getUTCFullYear() + '-' + month + '-' + day;
};

export function padZero(value) {
  value = value.toString();
  if (value.length === 1) {
    value = '0' + value;
  }
  return value;
};

export function getMonth(date) {
  return date.getUTCMonth() + 1;
};

export function getDayOfMonth(date) {
  return date.getUTCDate();
};

export function getYear(date) {
  return date.getUTCFullYear();
};

export function getDaysInMonth(date) {
  let year = getYear(date);
  let month = getMonth(date) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  date = getDate(`${year}-${padZero(month)}-01`);
  date = plusDays(date, -1);
  return getDayOfMonth(date);
};

export function getFirstDayOfMonth(date) {
  let [year, month, day] = getString(date).split('-');
  return getDate(`${year}-${month}-01`);
};

/**
 * 0-6 Sunday-Saturday.
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
 * @param {Number} flag
 * @returns {Number}
 */
export function dayOfWeekFromFlag(flag) {
  return Math.log(flag) / Math.log(2);
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

export function getMonthsBetween(start, end) {
  if (start > end) {
    let temp = end;
    end = start;
    start = temp;
  }
  let startYear = getYear(start);
  let startMonth = getMonth(start);
  let endYear = getYear(end);
  let endMonth = getMonth(end);
  let years = endYear - startYear;
  let months = 0;
  if (endMonth > startMonth) {
    months = endMonth - startMonth;
  } else if (endMonth < startMonth) {
    months = startMonth - endMonth;
    years -= 1;
  }
  months += years * 12;
  return months;
};

export function getYearsBetween(start, end) {
  return Math.abs(getYear(end) - getYear(start));
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
  let days = [0, 1, 2, 3, 4, 5, 6];
  let result = [];
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

export function find(array, callback) {
  let index = findIndex(array, callback);
  if (index > -1) {
    return array[index];
  } else {
    return null;
  }
};

export function findIndex(array, callback) {
  for (let i = 0; i < array.length; i++) {
    if (callback(array[i])) {
      return i;
    }
  }
  return -1;
};

export function repeat(string, times) {
  let ret = '';
  for (let i = 0; i < times; i++) {
    ret += string;
  }
  return ret;
};
