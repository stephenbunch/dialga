/**
 * @enum {Number}
 * Days of the week.
 */
export default {
  Sunday: 1,
  Monday: 2,
  Tuesday: 4,
  Wednesday: 8,
  Thursday: 16,
  Friday: 32,
  Saturday: 64,
  All: 1 | 2 | 4 | 8 | 16 | 32 | 64,
  Weekdays: 2 | 4 | 8 | 16 | 32,
  Weekends: 1 | 64
};
