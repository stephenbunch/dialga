import DAYS from './days';
import TYPE from './type';
import {
  dayOfWeekMaskToArray,
  durationToDays,
  durationToWeeks,
  extend,
  find,
  findIndex,
  getDate,
  getDayOfWeekFlag,
  getString,
  getSunday,
  hasFlag,
  normalizeDirection,
  plusDays,
  plusWeeks,
  repeat,
  validateDate
} from './util';
import InvalidPatternError from './errors/InvalidPatternError';
import InvalidOperationError from './errors/InvalidOperationError';
import NotSupportedError from './errors/NotSupportedError';
import Mask from './Mask';

export default class Pattern {
  /**
   * @param {PatternJson} [pattern]
   */
  constructor( pattern ) {
    this.value = extend({
      start_date: null,
      end_date: null,
      type: null,
      day_of_week_mask: null,
      day_of_month: null,
      month_of_year: null,
      interval: null,
      instance: null,
      exceptions: []
    }, pattern );
    this._validated = false;
  }

  /**
   * @returns {Pattern}
   */
  validate() {
    if ( this._validated ) {
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
  every( interval ) {
    this._validated = false;
    this.value.interval = interval || 1;
    return this;
  }

  /**
   * @returns {Pattern}
   */
  day() {
    this._validated = false;
    this.value.type = TYPE.Daily;
    this.value.day_of_week_mask = null;
    this.value.instance = null;
    return this;
  }

  /**
   * @returns {Pattern}
   */
  days() {
    return this.day();
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
    if ( this.value.instance ) {
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
    if ( this.value.instance ) {
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
  on( dayOfWeekMask ) {
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
  the( instance, dayOfWeek ) {
    this._validated = false;
    this.value.instance = instance;
    this.value.day_of_week_mask = dayOfWeek;
    return this;
  }

  /**
   * @param {Number} dayOfMonth
   * @returns {Pattern}
   */
  dayOfMonth( dayOfMonth ) {
    this._validated = false;
    this.value.instance = null;
    this.value.day_of_month = dayOfMonth;
    return this;
  }

  /**
   * @param {String} date
   * @returns {Pattern}
   */
  from( date ) {
    this._validated = false;
    this.value.start_date = date;
    return this;
  }

  /**
   * @param {String} date
   * @returns {Pattern}
   */
  to( date ) {
    this._validated = false;
    this.value.end_date = date;
    return this;
  }

  /**
   * @param {String} date
   * @param {String} newDate
   * @returns {Pattern}
   */
  addException( date, newDate ) {
    this._validated = false;
    var exception = find( this.value.exceptions, function( exception ) {
      return exception.original_date === date;
    });
    if ( !exception ) {
      exception = {};
      this.value.exceptions.push( exception );
    }
    exception.original_date = date;
    exception.date = newDate;
    return this;
  }

  /**
   * @param {String} date
   * @returns {Pattern}
   */
  removeException( date ) {
    this._validated = false;
    var index = findIndex( this.value.exceptions, function( exception ) {
      return exception.original_date === date;
    });
    if ( index > -1 ) {
      this.value.exceptions.splice( index, 1 );
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
  findException( date ) {
    return find( this.value.exceptions, function( exception ) {
      return exception.original_date === date;
    });
  }

  /**
   * Determines whether the specified date occurs in the recurrence pattern.
   * @param {String} date
   * @returns {Boolean}
   */
  matches( date ) {
    this.validate();
    if ( this._exceptionsByDate[ date ] ) {
      return true;
    }
    if ( this._moved[ date ] ) {
      return false;
    }
    if ( !this._doesOccurWithinPeriod( date ) ) {
      return false;
    }
    switch ( this.value.type ) {
      case TYPE.Daily:
        return this._doesMatchDailyInterval( getDate( date ) );
      case TYPE.Weekly:
        return (
          this._doesMatchDayOfWeek( getDate( date ) ) &&
          this._doesMatchWeeklyInterval( getDate( date ) )
        );
      default:
        return false;
    }
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
  toMask( end ) {
    end = end || this.value.end_date;
    if ( !end ) {
      throw new InvalidOperationError( 'An end date is required to generate a mask.' );
    }
    var mask = '';
    var last, next;
    while ( next = this.next( last ) ) {
      if ( next > end ) {
        break;
      }
      var days = durationToDays( getDate( next ) - getDate( last || this.value.start_date ) );
      if ( last ) {
        days -= 1;
      }
      mask += repeat( '0', days );
      mask += '1';
      last = next;
    }
    if ( mask ) {
      return new Mask( Mask.trim( this.value.start_date + '|' + mask ) );
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
  next( start, direction ) {
    this.validate();
    if ( typeof start !== "string" ) {
      direction = start;
      start = getString( plusDays( getDate( this.value.start_date ), -1 ) );
    }
    var date = start;
    while ( true ) {
      date = getString( this._getNextOccurrence( getDate( date ), normalizeDirection( direction ) ) );
      if ( this._doesOccurWithinPeriod( date ) ) {
        // See if there's an exception for this date.
        var exception = this._exceptionsByOriginalDate[ date ];
        if ( exception ) {
          if ( exception.date ) {
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
  nextPatternDate( start, direction ) {
    this.validate();
    var date = getString( this._getNextOccurrence( getDate( start ), normalizeDirection( direction ) ) );
    if ( this._doesOccurWithinPeriod( date ) ) {
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
  snap( date, direction ) {
    this.validate();
    return getString( this._snapToOccurrence( getDate( date ), normalizeDirection( direction ) ) );
  }

  _validatePeriod() {
    if ( !this.value.start_date ) {
      throw new InvalidPatternError( 'A start date is required.' );
    }
    this.value.start_date = String( this.value.start_date );
    validateDate( this.value.start_date );
    if ( this.value.end_date ) {
      this.value.end_date = String( this.value.end_date );
      validateDate( this.value.end_date );
      if ( this.value.start_date > this.value.end_date ) {
        throw new InvalidPatternError( 'The end date must be greater than or equal to the start date' );
      }
    }
  }

  _validateType() {
    if ( !this.value.type ) {
      throw new InvalidPatternError( 'A recurrence type is required.' );
    }
    this.value.type = Number( this.value.type );
    switch ( this.value.type ) {
      case TYPE.Daily:
      case TYPE.Weekly:
        break;

      case TYPE.Monthly:
      case TYPE.MonthNth:
      case TYPE.Yearly:
      case TYPE.YearNth:
        throw new NotSupportedError( '"Daily" and "Weekly" are the only recurrence types supported at this time.' );

      default:
        throw new InvalidPatternError( 'The recurrence type "' + this.value.type + '" is invalid.' );
    }
  }

  _validateDayOfWeekMask() {
    if ( this.value.type === TYPE.Weekly ) {
      if ( !this.value.day_of_week_mask ) {
        throw new InvalidPatternError( 'A day-of-week mask is required for weekly recurrence patterns.' );
      }
    } else {
      this.value.day_of_week_mask = null;
    }
  }

  _validateInterval() {
    if ( !this.value.interval ) {
      throw new InvalidPatternError( 'A recurrence interval is required.' );
    }
    this.value.interval = Number( this.value.interval );
    if ( isNaN( this.value.interval ) || this.value.interval <= 0 ) {
      throw new InvalidPatternError( 'The recurrence interval must be a number greater than 0.' );
    }
  }

  _validateExceptions() {
    var self = this;
    this._exceptionsByDate = {};
    this._exceptionsByOriginalDate = {};
    this._moved = {};
    this.value.exceptions = this.value.exceptions || [];

    this._validated = true;
    var exceptions = {};
    try {
      this.value.exceptions.forEach( function( exception ) {
        if ( !self.matches( exception.original_date ) ) {
          throw new InvalidPatternError( 'An exception exists for an invalid date "' + exception.original_date + '".' );
        }
        if ( exceptions[ exception.original_date ] ) {
          throw new InvalidPatternError( 'More than one exception exists for "' + exception.original_date + '".' );
        }
        if ( exception.date ) {
          if (
            exception.date < self.value.start_date ||
            !!self.value.end_date && exception.date > self.value.end_date
          ) {
            throw new InvalidPatternError( 'The exception for "' + exception.original_date + '" is outside the pattern period.' );
          }
          if ( exception.date !== exception.original_date && self.matches( exception.date ) ) {
            throw new InvalidPatternError( 'The exception for "' + exception.original_date + '" cannot occur on the same date as a regular occurrence."' );
          }
          if ( exceptions[ exception.original_date ] ) {
            throw new InvalidPatternError( 'More than one exception exists for "' + exception.original_date + '".' );
          }
          if ( exception.date <= self.nextPatternDate( exception.original_date, -1 ) ) {
            throw new InvalidPatternError( 'The exception for "' + exception.original_date + '" must occur after the previous occurrence.' );
          }
          if ( exception.date >= self.nextPatternDate( exception.original_date, 1 ) ) {
            throw new InvalidPatternError( 'The exception for "' + exception.original_date + '" must occur before the next occurrence.' );
          }
        }
        exceptions[ exception.original_date ] = true;
      });
    } finally {
      this._validated = false;
    }

    this.value.exceptions.forEach( function( exception ) {
      self._exceptionsByOriginalDate[ exception.original_date ] = exception;
      if ( exception.original_date !== exception.date ) {
        self._moved[ exception.original_date ] = true;
      }
      if ( exception.date ) {
        self._exceptionsByDate[ exception.date ] = exception;
      }
    });
  }

  /**
   * @private
   * @param {String} date
   * @returns {Boolean}
   */
  _doesOccurWithinPeriod( date ) {
    return (
      date >= this.value.start_date &&
      ( !this.value.end_date || date <= this.value.end_date )
    );
  }

  /**
   * @private
   * @param {Date} date
   * @returns {Boolean}
   */
  _doesMatchDayOfWeek( date ) {
    return hasFlag( this.value.day_of_week_mask, getDayOfWeekFlag( date ) );
  }

  /**
   * @private
   * @param {Date} date
   * @returns {Boolean}
   */
  _doesMatchDailyInterval( date ) {
    var days = durationToDays( date - getDate( this.value.start_date ) );
    return days % this.value.interval === 0;
  }

  /**
   * @private
   * @param {Date} date
   * @returns {Boolean}
   */
  _doesMatchWeeklyInterval( date ) {
    var start = getSunday( getDate( this.value.start_date ) );
    var end = getSunday( date );
    var weeks = durationToWeeks( end - start );
    return weeks % this.value.interval === 0;
  }

  /**
   * @private
   * @param {Date} start The date to start from.
   * @param {Number} direction A distance multiplier. Must be 1 or -1.
   * @returns {Date}
   */
  _getNextOccurrence( start, direction ) {
    var date = this._snapToOccurrence( start, direction );
    if ( +date !== +start ) {
      return date;
    }
    switch ( this.value.type ) {
      case TYPE.Daily:
        return this._getNextDailyOccurrence( date, direction );
      case TYPE.Weekly:
        return this._getNextWeeklyOccurrence( date, direction );
    }
  }

  /**
   * @private
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  _getNextDailyOccurrence( date, direction ) {
    return plusDays( date, this.value.interval * direction );
  }

  /**
   * @private
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  _getNextWeeklyOccurrence( date, direction ) {
    do {
      date = plusDays( date, direction );
      // If it's Sunday, jump to the next valid week. If the interval is 1,
      // then we're already there.
      if ( getDayOfWeekFlag( date ) === DAYS.Sunday ) {
        date = plusWeeks( date, ( this.value.interval - 1 ) * direction );
      }
    } while ( !this._doesMatchDayOfWeek( date ) );
    return date;
  }

  /**
   * @private
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  _snapToOccurrence( date, direction ) {
    if ( direction > 0 ) {
      var patternStart = getDate( this.value.start_date );
      if ( date < patternStart ) {
        date = patternStart;
      }
    } else if ( this.value.end_date ) {
      var patternEnd = getDate( this.value.end_date );
      if ( date > patternEnd ) {
        date = patternEnd;
      }
    }
    switch ( this.value.type ) {
      case TYPE.Daily:
        return this._snapToDailyOccurrence( date, direction );
      case TYPE.Weekly:
        return this._snapToWeeklyOccurrence( date, direction );
    }
  }

  /**
   * @private
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  _snapToDailyOccurrence( date, direction ) {
    var start = getDate( this.value.start_date );
    var remainder = durationToDays( date - start ) % this.value.interval;
    return plusDays( date, remainder * direction );
  }

  /**
   * @private
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */
  _snapToWeeklyOccurrence( date, direction ) {
    while ( !this._doesMatchDayOfWeek( date ) ) {
      date = plusDays( date, direction );
    }

    var firstDay = getDate( this.value.start_date );
    while ( !this._doesMatchDayOfWeek( firstDay ) ) {
      firstDay = plusDays( firstDay, 1 );
    }
    if ( date <= firstDay ) {
      return firstDay;
    }

    if ( this.value.end_date ) {
      var lastDay = getDate( this.value.end_date );
      while ( !this._doesMatchDayOfWeek( lastDay ) ) {
        lastDay = plusDays( lastDay, -1 );
      }
      if ( date >= lastDay ) {
        return lastDay;
      }
    }

    var remainder = durationToWeeks( getSunday( date ) - getSunday( firstDay ) ) % this.value.interval;
    if ( remainder > 0 ) {
      date = plusWeeks( date, remainder * direction );
      var maskDays = dayOfWeekMaskToArray( this.value.day_of_week_mask );
      if ( direction > 0 ) {
        // Starting from Sunday, get the first valid date going forward from
        // Sunday to Saturday.
        return plusDays( getSunday( date ), maskDays[0] );
      } else {
        // Starting from next Sunday, get the first valid date going backward
        // from Saturday to Sunday.
        return plusDays( getSunday( plusWeeks( date, 1 ) ), -( 7 - maskDays[ maskDays.length - 1 ] ) );
      }
    } else {
      return date;
    }
  }
};

[
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'
].forEach( function( month, index ) {
  Pattern.prototype[ month.toLowerCase() ] = function( dayOfMonth ) {
    this._validated = false;
    this.value.month_of_year = index + 1;
    this.value.day_of_month = dayOfMonth;
    this.value.instance = null;
    return this;
  };

  Pattern.prototype[ 'of' + month ] = function( dayOfMonth ) {
    this._validated = false;
    this.value.month_of_year = index + 1;
    this.value.day_of_month = dayOfMonth;
    return this;
  };
});
