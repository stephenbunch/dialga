/**
 * @typedef PatternJson
 * https://msdn.microsoft.com/en-us/library/microsoft.office.interop.outlook.recurrencepattern_members(v=office.15).aspx
 * @type {Object}
 *
 * @property {String} start_date The start date of the recurrence pattern.
 * @property {String} [end_date] The end date of the recurrence pattern.
 * @property {Number} type The recurrence type.
 * @property {Number} [day_of_week_mask]
 *   Represents the mask for the days of the week on which the recurrence
 *   pattern is valid. This value is required for Weekly, MonthNth, and YearNth
 *   recurrence patterns. For "nth" types, the mask can only represent a single
 *   day of the week.
 * @property {Number} [day_of_month]
 *   The day of month. Can be any number between 1 and 31. If a month has
 *   fewer days than the specified value, the last day of the month is used.
 *   This value is required for Monthly and Yearly recurrence patterns.
 * @property {Number} [month_of_year]
 *   The month of year. Can be any number between 1 and 12. This value is
 *   required for Yearly and YearNth recurrence patterns.
 * @property {Number} interval
 *   The recurrence interval. For example, a daily recurrence pattern with an
 *   interval of 2 would read "every other day".
 * @property {Number} [instance]
 *   Represents the "nth" instance of a particular day of week in the month.
 *   This value is required for MonthNth and YearNth recurrence patterns. Can
 *   be any number between 1 and 5. A YearNth pattern would read like, "The
 *   2nd Monday of June every year."
 * @property {Array.<Exception>} exceptions
 */

/**
 * @typedef Exception
 * @property {String} original_date The original date of the occurrence.
 * @property {String} [date] The new date of the occurrence, or null of deleted.
 */
