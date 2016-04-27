import InvalidMaskError from './errors/InvalidMaskError';
import {
  durationToDays,
  getDate,
  getString,
  plusDays,
  repeat,
  validateDate
} from './util';

export default class Mask {
  /**
   * A mask contains a start date and a series of 1s and 0s where a 1 represents
   * an occurrence. A mask always starts and ends with a 1. It may also contain a
   * single 1 if there is only one occurrence.
   * @param {String} mask
   */
  constructor( mask ) {
    this.value = mask || '';
    this.start_date = null;

    if ( this.value ) {
      var parts = this.value.split( '|' );
      if ( parts.length !== 2 ) {
        throw new InvalidMaskError( 'Mask is invalid. Expected format [yyyy-mm-dd]|[mask] but found "' + this.value + '".' );
      }
      validateDate( parts[0] );
      this.start_date = parts[0];
      if ( parts[1][0] !== '1' ) {
        throw new InvalidMaskError( 'Mask format is invalid. Mask value should begin with a "1".' );
      }
      if ( parts[1][ parts[1].length - 1 ] !== '1' ) {
        throw new InvalidMaskError( 'Mask format is invalid. Mask value should end with a "1".' );
      }
    }
  }

  toJSON() {
    return this.toString();
  }

  toString() {
    return this.value;
  }

  /**
   * @param {Mask|String} mask
   * @returns {Mask}
   */
  or( mask ) {
    return this._op( mask, ( a, b ) => {
      return Boolean( Number( a ) ) | Boolean( Number( b ) );
    });
  }

  /**
   * @param {Mask|String} mask
   * @returns {Mask}
   */
  and( mask ) {
    return this._op( mask, ( a, b ) => {
      return Boolean( Number( a ) ) & Boolean( Number( b ) );
    });
  }

  /**
   * @param {Mask|String} mask
   * @returns {Mask}
   */
  xor( mask ) {
    return this._op( mask, ( a, b ) => {
      return Boolean( Number( a ) ) ^ Boolean( Number( b ) );
    });
  }

  /**
   * @param {Mask|String} mask
   * @returns {Mask}
   */
  not( mask ) {
    return this._op( mask, ( a, b ) => {
      if ( Boolean( Number( b ) ) ) {
        return 0;
      } else {
        return Number( Boolean( Number( a ) ) );
      }
    });
  }

  /**
   * @param {String} date
   * @returns {Boolean}
   */
  matches( date ) {
    if ( !this.value ) {
      return false;
    }
    var values = this.value.split( '|' );
    var start = values[0];
    if ( date < start ) {
      return false;
    }
    var index = durationToDays( getDate( date ) - getDate( start ) );
    return values[1][ index ] === '1';
  }

  /**
   * @returns {Array.<String>}
   */
  getDates() {
    if ( !this.value ) {
      return [];
    }
    var dates = [];
    var values = this.value.split( '|' );
    var start = values[0];
    dates.push( start );
    start = getDate( start );
    var days = values[1].split( '' );
    var length = days.length;
    for ( var i = 1; i < length; i++ ) {
      if ( days[ i ] === '1' ) {
        dates.push( getString( plusDays( start, i ) ) );
      }
    }
    return dates;
  }

  /**
   * @returns {Array.<String>|null}
   */
  getRange() {
    if ( !this.value ) {
      return null;
    }
    var values = this.value.split( '|' );
    var start = getDate( values[0] );
    var end = plusDays( start, values[1].length - 1 );
    return [ getString( start ), getString( end ) ];
  }

  /**
   * @param {String} date
   * @returns {Mask}
   */
  addDate( date ) {
    return this.or( date + '|1' );
  }

  /**
   * @param {String} date
   * @returns {Mask}
   */
  removeDate( date ) {
    return this.not( date + '|1' );
  }

  /**
   * @param {String} date
   * @param {Boolean} [state]
   * @returns {Mask}
   */
  toggleDate( date, state ) {
    if ( state === undefined ) {
      if ( this.matches( date ) ) {
        return this.removeDate( date );
      } else {
        return this.addDate( date );
      }
    } else {
      if ( state ) {
        return this.addDate( date );
      } else {
        return this.removeDate( date );
      }
    }
  }

  _op( mask, op ) {
    var masks = Mask.commonalize( this.value, mask );
    if ( !masks[0] ) {
      return new Mask();
    }
    var a = masks[0].split( '|' )[1].split( '' );
    var b = masks[1].split( '|' )[1].split( '' );
    var result = [];
    var length = a.length;
    for ( var i = 0; i < length; i++ ) {
      result[ i ] = op( a[ i ], b[ i ] );
    }
    return new Mask( Mask.trim( masks[0].split( '|' )[0] + '|' + result.join( '' ) ), false );
  };

  /**
   * @param {Array.<String>} dates
   * @returns {Mask}
   */
  static fromDates( dates ) {
    if ( !dates || !dates.length ) {
      return new Mask();
    }
    dates = dates.slice().sort();
    var start = dates[0];
    var mask = '1';
    var length = dates.length;
    for ( var i = 1; i < length; i++ ) {
      mask += repeat( '0', durationToDays( getDate( dates[ i ] ) - getDate( dates[ i - 1 ] ) ) - 1 );
      mask += '1';
    }
    return new Mask( start + '|' + mask );
  }

  /**
   * Trims the mask. Any leading and trailing zeros are removed, and the start
   * date is updated accordingly.
   * @param {String} mask
   * @returns {String}
   */
  static trim( mask ) {
    if ( !mask || mask.indexOf( '1' ) === -1 ) {
      return '';
    } else {
      var parts = mask.split( '|' );
      var start = parts[0];
      var value = parts[1];
      if ( value.indexOf( '1' ) === -1 ) {
        return '';
      } else if ( value[0] === '1' && value[ value.length - 1 ] === '1' ) {
        return mask;
      } else {
        start = getString( plusDays( getDate( start ), value.indexOf( '1' ) ) );
        value = value.substring( value.indexOf( '1' ), value.lastIndexOf( '1' ) + 1 );
        return start + '|' + value;
      }
    }
  }

  /**
   * Takes two masks and returns two new masks with the same start and end dates
   * Note that these masks are potentially invalid since they are untrimmed. To
   * trim them, use Mask.trim().
   * @param {Mask|String} maskA
   * @param {Mask|String} maskB
   * @returns {Array.<String>}
   */
  static commonalize( maskA, maskB ) {
    maskA = maskA && maskA.toString();
    maskB = maskB && maskB.toString();
    var a = !!maskA && maskA.split( '|' );
    var b = !!maskB && maskB.split( '|' );
    if ( !a && !b ) {
      return [ '', '' ];
    }
    if ( !a ) {
      a = [ b[0], repeat( '0', b[1].length ) ];
    } else if ( !b ) {
      b = [ a[0], repeat( '0', a[1].length ) ];
    }
    var diff;
    if ( a[0] < b[0] ) {
      diff = durationToDays( getDate( b[0] ) - getDate( a[0] ) );
      a[1] += repeat( '0', diff );
      b[1] = repeat( '0', diff ) + b[1];
      b[0] = a[0];
    } else if ( b[0] < a[0] ) {
      diff = durationToDays( getDate( a[0] ) - getDate( b[0] ) );
      b[1] += repeat( '0', diff );
      a[1] = repeat( '0', diff ) + a[1];
      a[0] = b[0];
    }
    if ( a[1].length < b[1].length ) {
      a[1] += repeat( '0', b[1].length - a[1].length );
    }
    if ( b[1].length < a[1].length ) {
      b[1] += repeat( '0', a[1].length - b[1].length );
    }
    return [ a.join( '|' ), b.join( '|' ) ];
  }
};
