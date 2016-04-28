(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Dialga = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DailyEngine = function () {
  function DailyEngine(pattern) {
    _classCallCheck(this, DailyEngine);

    this._interval = pattern.interval;
    this._startDate = pattern.start_date;
    this._firstOccurrence = (0, _util.getDate)(pattern.start_date);
    this._lastOccurrence = pattern.end_date ? (0, _util.getDate)(pattern.end_date) : null;
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */


  _createClass(DailyEngine, [{
    key: 'snapToOccurrence',
    value: function snapToOccurrence(date, direction) {
      var remainder = (0, _util.durationToDays)(date - this._firstOccurrence) % this._interval;
      var occurrence = (0, _util.plusDays)(date, remainder * direction);
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

  }, {
    key: 'next',
    value: function next(occurrence, direction) {
      return (0, _util.plusDays)(occurrence, this._interval * direction);
    }

    /**
     * Gets a value indicating whether the date falls on the pattern interval.
     * @param {Date} date
     * @returns {Boolean}
     */

  }, {
    key: 'matchesInterval',
    value: function matchesInterval(date) {
      var days = (0, _util.durationToDays)(date - (0, _util.getDate)(this._startDate));
      return days % this._interval === 0;
    }
  }]);

  return DailyEngine;
}();

exports.default = DailyEngine;
;

},{"./util":17}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _InvalidMaskError = require('./errors/InvalidMaskError');

var _InvalidMaskError2 = _interopRequireDefault(_InvalidMaskError);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mask = function () {
  /**
   * A mask contains a start date and a series of 1s and 0s where a 1 represents
   * an occurrence. A mask always starts and ends with a 1. It may also contain a
   * single 1 if there is only one occurrence.
   * @param {String} mask
   */

  function Mask(mask) {
    _classCallCheck(this, Mask);

    this.value = mask || '';
    this.start_date = null;

    if (this.value) {
      var parts = this.value.split('|');
      if (parts.length !== 2) {
        throw new _InvalidMaskError2.default('Mask is invalid. Expected format [yyyy-mm-dd]|[mask] but found "' + this.value + '".');
      }
      (0, _util.validateDate)(parts[0]);
      this.start_date = parts[0];
      if (parts[1][0] !== '1') {
        throw new _InvalidMaskError2.default('Mask format is invalid. Mask value should begin with a "1".');
      }
      if (parts[1][parts[1].length - 1] !== '1') {
        throw new _InvalidMaskError2.default('Mask format is invalid. Mask value should end with a "1".');
      }
    }
  }

  _createClass(Mask, [{
    key: 'toJSON',
    value: function toJSON() {
      return this.toString();
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.value;
    }

    /**
     * @param {Mask|String} mask
     * @returns {Mask}
     */

  }, {
    key: 'or',
    value: function or(mask) {
      return this._op(mask, function (a, b) {
        return Boolean(Number(a)) | Boolean(Number(b));
      });
    }

    /**
     * @param {Mask|String} mask
     * @returns {Mask}
     */

  }, {
    key: 'and',
    value: function and(mask) {
      return this._op(mask, function (a, b) {
        return Boolean(Number(a)) & Boolean(Number(b));
      });
    }

    /**
     * @param {Mask|String} mask
     * @returns {Mask}
     */

  }, {
    key: 'xor',
    value: function xor(mask) {
      return this._op(mask, function (a, b) {
        return Boolean(Number(a)) ^ Boolean(Number(b));
      });
    }

    /**
     * @param {Mask|String} mask
     * @returns {Mask}
     */

  }, {
    key: 'not',
    value: function not(mask) {
      return this._op(mask, function (a, b) {
        if (Boolean(Number(b))) {
          return 0;
        } else {
          return Number(Boolean(Number(a)));
        }
      });
    }

    /**
     * @param {String} date
     * @returns {Boolean}
     */

  }, {
    key: 'matches',
    value: function matches(date) {
      if (!this.value) {
        return false;
      }
      var values = this.value.split('|');
      var start = values[0];
      if (date < start) {
        return false;
      }
      var index = (0, _util.durationToDays)((0, _util.getDate)(date) - (0, _util.getDate)(start));
      return values[1][index] === '1';
    }

    /**
     * @returns {Array.<String>}
     */

  }, {
    key: 'getDates',
    value: function getDates() {
      if (!this.value) {
        return [];
      }
      var dates = [];
      var values = this.value.split('|');
      var start = values[0];
      dates.push(start);
      start = (0, _util.getDate)(start);
      var days = values[1].split('');
      var length = days.length;
      for (var i = 1; i < length; i++) {
        if (days[i] === '1') {
          dates.push((0, _util.getString)((0, _util.plusDays)(start, i)));
        }
      }
      return dates;
    }

    /**
     * @returns {Array.<String>|null}
     */

  }, {
    key: 'getRange',
    value: function getRange() {
      if (!this.value) {
        return null;
      }
      var values = this.value.split('|');
      var start = (0, _util.getDate)(values[0]);
      var end = (0, _util.plusDays)(start, values[1].length - 1);
      return [(0, _util.getString)(start), (0, _util.getString)(end)];
    }

    /**
     * @param {String} date
     * @returns {Mask}
     */

  }, {
    key: 'addDate',
    value: function addDate(date) {
      return this.or(date + '|1');
    }

    /**
     * @param {String} date
     * @returns {Mask}
     */

  }, {
    key: 'removeDate',
    value: function removeDate(date) {
      return this.not(date + '|1');
    }

    /**
     * @param {String} date
     * @param {Boolean} [state]
     * @returns {Mask}
     */

  }, {
    key: 'toggleDate',
    value: function toggleDate(date, state) {
      if (state === undefined) {
        if (this.matches(date)) {
          return this.removeDate(date);
        } else {
          return this.addDate(date);
        }
      } else {
        if (state) {
          return this.addDate(date);
        } else {
          return this.removeDate(date);
        }
      }
    }
  }, {
    key: '_op',
    value: function _op(mask, op) {
      var masks = Mask.commonalize(this.value, mask);
      if (!masks[0]) {
        return new Mask();
      }
      var a = masks[0].split('|')[1].split('');
      var b = masks[1].split('|')[1].split('');
      var result = [];
      var length = a.length;
      for (var i = 0; i < length; i++) {
        result[i] = op(a[i], b[i]);
      }
      return new Mask(Mask.trim(masks[0].split('|')[0] + '|' + result.join('')), false);
    }
  }], [{
    key: 'fromDates',


    /**
     * @param {Array.<String>} dates
     * @returns {Mask}
     */
    value: function fromDates(dates) {
      if (!dates || !dates.length) {
        return new Mask();
      }
      dates = dates.slice().sort();
      var start = dates[0];
      var mask = '1';
      var length = dates.length;
      for (var i = 1; i < length; i++) {
        mask += (0, _util.repeat)('0', (0, _util.durationToDays)((0, _util.getDate)(dates[i]) - (0, _util.getDate)(dates[i - 1])) - 1);
        mask += '1';
      }
      return new Mask(start + '|' + mask);
    }

    /**
     * Trims the mask. Any leading and trailing zeros are removed, and the start
     * date is updated accordingly.
     * @param {String} mask
     * @returns {String}
     */

  }, {
    key: 'trim',
    value: function trim(mask) {
      if (!mask || mask.indexOf('1') === -1) {
        return '';
      } else {
        var parts = mask.split('|');
        var start = parts[0];
        var value = parts[1];
        if (value.indexOf('1') === -1) {
          return '';
        } else if (value[0] === '1' && value[value.length - 1] === '1') {
          return mask;
        } else {
          start = (0, _util.getString)((0, _util.plusDays)((0, _util.getDate)(start), value.indexOf('1')));
          value = value.substring(value.indexOf('1'), value.lastIndexOf('1') + 1);
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

  }, {
    key: 'commonalize',
    value: function commonalize(maskA, maskB) {
      maskA = maskA && maskA.toString();
      maskB = maskB && maskB.toString();
      var a = !!maskA && maskA.split('|');
      var b = !!maskB && maskB.split('|');
      if (!a && !b) {
        return ['', ''];
      }
      if (!a) {
        a = [b[0], (0, _util.repeat)('0', b[1].length)];
      } else if (!b) {
        b = [a[0], (0, _util.repeat)('0', a[1].length)];
      }
      var diff = void 0;
      if (a[0] < b[0]) {
        diff = (0, _util.durationToDays)((0, _util.getDate)(b[0]) - (0, _util.getDate)(a[0]));
        a[1] += (0, _util.repeat)('0', diff);
        b[1] = (0, _util.repeat)('0', diff) + b[1];
        b[0] = a[0];
      } else if (b[0] < a[0]) {
        diff = (0, _util.durationToDays)((0, _util.getDate)(a[0]) - (0, _util.getDate)(b[0]));
        b[1] += (0, _util.repeat)('0', diff);
        a[1] = (0, _util.repeat)('0', diff) + a[1];
        a[0] = b[0];
      }
      if (a[1].length < b[1].length) {
        a[1] += (0, _util.repeat)('0', b[1].length - a[1].length);
      }
      if (b[1].length < a[1].length) {
        b[1] += (0, _util.repeat)('0', a[1].length - b[1].length);
      }
      return [a.join('|'), b.join('|')];
    }
  }]);

  return Mask;
}();

exports.default = Mask;
;

},{"./errors/InvalidMaskError":12,"./util":17}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MonthEngine = function () {
  function MonthEngine(_ref) {
    var start = _ref.start;
    var end = _ref.end;
    var interval = _ref.interval;
    var resolve = _ref.resolve;

    _classCallCheck(this, MonthEngine);

    this._interval = interval;
    this._resolve = resolve;

    var patternStart = (0, _util.getDate)(start);
    var year = (0, _util.getYear)(patternStart);
    var month = (0, _util.getMonth)(patternStart);
    var firstOccurrence = this._resolveDate(year, month);
    if (firstOccurrence < patternStart) {
      firstOccurrence = this._resolveDate(year, month + interval);
    }
    this.firstOccurrence = firstOccurrence;

    if (end) {
      this.lastOccurrence = this._getOccurrenceUntil((0, _util.getDate)(end));
    } else {
      this.lastOccurrence = null;
    }
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */


  _createClass(MonthEngine, [{
    key: 'snapToOccurrence',
    value: function snapToOccurrence(date, direction) {
      var occurrence = this._getOccurrenceUntil(date);
      if (occurrence < date && direction > 0) {
        occurrence = this._resolveDate((0, _util.getYear)(occurrence), (0, _util.getMonth)(occurrence) + this._interval);
      } else if (occurrence > date && direction < 0) {
        occurrence = this._resolveDate((0, _util.getYear)(occurrence), (0, _util.getMonth)(occurrence) - this._interval);
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

  }, {
    key: 'next',
    value: function next(occurrence, direction) {
      return this._resolveDate((0, _util.getYear)(occurrence), (0, _util.getMonth)(occurrence) + this._interval * direction);
    }

    /**
     * @param {Date} date
     * @returns {Date}
     */

  }, {
    key: '_getOccurrenceUntil',
    value: function _getOccurrenceUntil(date) {
      if (date < this.firstOccurrence) {
        return this.firstOccurrence;
      }
      var months = Math.floor((0, _util.getMonthsBetween)(this.firstOccurrence, date) / this._interval) * this._interval;
      var occurrence = this._resolveDate((0, _util.getYear)(this.firstOccurrence), (0, _util.getMonth)(this.firstOccurrence) + months);
      if (occurrence > date) {
        occurrence = this._resolveDate((0, _util.getYear)(occurrence), (0, _util.getMonth)(occurrence) - this._interval);
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

  }, {
    key: '_resolveDate',
    value: function _resolveDate(year, month) {
      if (month > 12) {
        year += Math.floor(month / 12);
        month -= Math.floor(month / 12) * 12;
      } else if (month < 1) {
        year -= Math.ceil((month - 1) * -1 / 12);
        month += Math.ceil((month - 1) * -1 / 12) * 12;
      }
      return this._resolve(year, month);
    }
  }]);

  return MonthEngine;
}();

exports.default = MonthEngine;
;

},{"./util":17}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

var _MonthEngine = require('./MonthEngine');

var _MonthEngine2 = _interopRequireDefault(_MonthEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MonthNthEngine = function () {
  function MonthNthEngine(pattern) {
    var _this = this;

    _classCallCheck(this, MonthNthEngine);

    this._dayOfWeek = (0, _util.dayOfWeekFromFlag)(pattern.day_of_week_mask);
    this._interval = pattern.interval;
    this._instance = pattern.instance;
    this._engine = new _MonthEngine2.default({
      start: pattern.start_date,
      end: pattern.end_date,
      interval: this._interval,
      resolve: function resolve(year, month) {
        return (0, _util.resolveInstanceDate)(year, month, _this._instance, _this._dayOfWeek);
      }
    });
  }

  _createClass(MonthNthEngine, [{
    key: 'snapToOccurrence',
    value: function snapToOccurrence(date, direction) {
      return this._engine.snapToOccurrence(date, direction);
    }
  }, {
    key: 'next',
    value: function next(occurrence, direction) {
      return this._engine.next(occurrence, direction);
    }
  }, {
    key: 'matchesInterval',
    value: function matchesInterval(date) {
      return (0, _util.getDayOfWeek)(date) === this._dayOfWeek && (0, _util.getInstance)(date) === this._instance && (0, _util.getMonthsBetween)(date, this._engine.firstOccurrence) % this._interval === 0;
    }
  }]);

  return MonthNthEngine;
}();

exports.default = MonthNthEngine;
;

},{"./MonthEngine":3,"./util":17}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

var _MonthEngine = require('./MonthEngine');

var _MonthEngine2 = _interopRequireDefault(_MonthEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MonthlyEngine = function () {
  function MonthlyEngine(pattern) {
    _classCallCheck(this, MonthlyEngine);

    this._interval = pattern.interval;
    this._day = pattern.day_of_month;
    this._engine = new _MonthEngine2.default({
      start: pattern.start_date,
      end: pattern.end_date,
      interval: pattern.interval,
      resolve: function resolve(year, month) {
        return (0, _util.resolveDate)(year, month, pattern.day_of_month);
      }
    });
  }

  /**
   * @param {Date} date
   * @param {Number} direction
   * @returns {Date}
   */


  _createClass(MonthlyEngine, [{
    key: 'snapToOccurrence',
    value: function snapToOccurrence(date, direction) {
      return this._engine.snapToOccurrence(date, direction);
    }

    /**
     * @param {Date} date
     * @param {Number} direction
     * @returns {Date}
     */

  }, {
    key: 'next',
    value: function next(occurrence, direction) {
      return this._engine.next(occurrence, direction);
    }

    /**
     * Gets a value indicating whether the date falls on the pattern interval.
     * @param {Date} date
     * @returns {Date}
     */

  }, {
    key: 'matchesInterval',
    value: function matchesInterval(date) {
      return +(0, _util.resolveDate)((0, _util.getYear)(date), (0, _util.getMonth)(date), this._day) === +date && (0, _util.getMonthsBetween)(this._engine.firstOccurrence, date) % this._interval === 0;
    }
  }]);

  return MonthlyEngine;
}();

exports.default = MonthlyEngine;
;

},{"./MonthEngine":3,"./util":17}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _util = require('./util');

var _InvalidPatternError = require('./errors/InvalidPatternError');

var _InvalidPatternError2 = _interopRequireDefault(_InvalidPatternError);

var _InvalidOperationError = require('./errors/InvalidOperationError');

var _InvalidOperationError2 = _interopRequireDefault(_InvalidOperationError);

var _Mask = require('./Mask');

var _Mask2 = _interopRequireDefault(_Mask);

var _DailyEngine = require('./DailyEngine');

var _DailyEngine2 = _interopRequireDefault(_DailyEngine);

var _WeeklyEngine = require('./WeeklyEngine');

var _WeeklyEngine2 = _interopRequireDefault(_WeeklyEngine);

var _MonthlyEngine = require('./MonthlyEngine');

var _MonthlyEngine2 = _interopRequireDefault(_MonthlyEngine);

var _MonthNthEngine = require('./MonthNthEngine');

var _MonthNthEngine2 = _interopRequireDefault(_MonthNthEngine);

var _YearlyEngine = require('./YearlyEngine');

var _YearlyEngine2 = _interopRequireDefault(_YearlyEngine);

var _YearNthEngine = require('./YearNthEngine');

var _YearNthEngine2 = _interopRequireDefault(_YearNthEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pattern = function () {
  /**
   * @param {PatternJson} [pattern]
   */

  function Pattern(pattern) {
    _classCallCheck(this, Pattern);

    this.value = _extends({
      start_date: null,
      end_date: null,
      type: null,
      day_of_week_mask: null,
      day_of_month: null,
      month_of_year: null,
      interval: null,
      instance: null,
      exceptions: []
    }, pattern);
    this._validated = false;
  }

  /**
   * @returns {Pattern}
   */


  _createClass(Pattern, [{
    key: 'validate',
    value: function validate() {
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

  }, {
    key: 'every',
    value: function every() {
      var interval = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      this._validated = false;
      this.value.interval = interval;
      return this;
    }

    /**
     * @param {Number} [dayOfMonth]
     * @returns {Pattern}
     */

  }, {
    key: 'day',
    value: function day(dayOfMonth) {
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

  }, {
    key: 'days',
    value: function days() {
      this._validated = false;
      this.value.type = _type2.default.Daily;
      this.value.day_of_week_mask = null;
      this.value.instance = null;
      return this;
    }

    /**
     * @returns {Pattern}
     */

  }, {
    key: 'week',
    value: function week() {
      this._validated = false;
      this.value.type = _type2.default.Weekly;
      return this;
    }

    /**
     * @returns {Pattern}
     */

  }, {
    key: 'weeks',
    value: function weeks() {
      return this.week();
    }

    /**
     * @returns {Pattern}
     */

  }, {
    key: 'month',
    value: function month() {
      this._validated = false;
      if (this.value.instance) {
        this.value.type = _type2.default.MonthNth;
      } else {
        this.value.type = _type2.default.Monthly;
        this.value.day_of_week_mask = null;
      }
      return this;
    }

    /**
     * @returns {Pattern}
     */

  }, {
    key: 'months',
    value: function months() {
      return this.month();
    }

    /**
     * @returns {Pattern}
     */

  }, {
    key: 'year',
    value: function year() {
      this._validated = false;
      if (this.value.instance) {
        this.value.type = _type2.default.YearNth;
      } else {
        this.value.type = _type2.default.Yearly;
        this.value.day_of_week_mask = null;
      }
      return this;
    }

    /**
     * @returns {Pattern}
     */

  }, {
    key: 'years',
    value: function years() {
      return this.year();
    }

    /**
     * @param {Number} dayOfWeekMask
     * @returns {Pattern}
     */

  }, {
    key: 'on',
    value: function on(dayOfWeekMask) {
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

  }, {
    key: 'the',
    value: function the(instance, dayOfWeek) {
      this._validated = false;
      this.value.instance = instance;
      this.value.day_of_week_mask = dayOfWeek;
      return this;
    }

    /**
     * @param {String} date
     * @returns {Pattern}
     */

  }, {
    key: 'from',
    value: function from(date) {
      this._validated = false;
      this.value.start_date = date;
      return this;
    }

    /**
     * @param {String} date
     * @returns {Pattern}
     */

  }, {
    key: 'to',
    value: function to(date) {
      this._validated = false;
      this.value.end_date = date;
      return this;
    }

    /**
     * @param {String} date
     * @param {String} newDate
     * @returns {Pattern}
     */

  }, {
    key: 'addException',
    value: function addException(date, newDate) {
      this._validated = false;
      var exception = (0, _util.find)(this.value.exceptions, function (exception) {
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

  }, {
    key: 'removeException',
    value: function removeException(date) {
      this._validated = false;
      var index = (0, _util.findIndex)(this.value.exceptions, function (exception) {
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

  }, {
    key: 'removeAllExceptions',
    value: function removeAllExceptions() {
      this._validated = false;
      this.value.exceptions = [];
      return this;
    }

    /**
     * @param {String} date
     * @returns {Pattern}
     */

  }, {
    key: 'findException',
    value: function findException(date) {
      return (0, _util.find)(this.value.exceptions, function (exception) {
        return exception.original_date === date;
      });
    }

    /**
     * Determines whether the specified date occurs in the recurrence pattern.
     * @param {String} date
     * @returns {Boolean}
     */

  }, {
    key: 'matches',
    value: function matches(date) {
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
      return this._engine.matchesInterval((0, _util.getDate)(date));
    }

    /**
     * Gets the recurrence pattern as a plain old JSON object.
     * @returns {PatternJson}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.value;
    }

    /**
     * @param {String} [end]
     * @returns {Mask}
     */

  }, {
    key: 'toMask',
    value: function toMask(end) {
      end = end || this.value.end_date;
      if (!end) {
        throw new _InvalidOperationError2.default('An end date is required to generate a mask.');
      }
      var mask = '';
      var last = void 0,
          next = void 0;
      while (next = this.next(last)) {
        if (next > end) {
          break;
        }
        var days = (0, _util.durationToDays)((0, _util.getDate)(next) - (0, _util.getDate)(last || this.value.start_date));
        if (last) {
          days -= 1;
        }
        mask += (0, _util.repeat)('0', days);
        mask += '1';
        last = next;
      }
      if (mask) {
        return new _Mask2.default(_Mask2.default.trim(this.value.start_date + '|' + mask));
      } else {
        return new _Mask2.default();
      }
    }
  }, {
    key: 'next',


    /**
     * Gets the next occurrence or exception in the recurrence pattern after the
     * specified date or returns false if there are no more occurrences.
     * @param {String} [start] The date to search from.
     * @param {Number} [direction]
     *   A value indicating direction. Positive goes forward, negative goes backward.
     * @returns {String|Boolean}
     */
    value: function next(start, direction) {
      this.validate();
      if (typeof start !== "string") {
        direction = start;
        start = (0, _util.getString)((0, _util.plusDays)((0, _util.getDate)(this.value.start_date), -1));
      }
      var date = start;
      while (true) {
        date = (0, _util.getString)(this._getNextOccurrence((0, _util.getDate)(date), (0, _util.normalizeDirection)(direction)));
        if (this._doesOccurWithinPeriod(date)) {
          // See if there's an exception for this date.
          var exception = this._exceptionsByOriginalDate[date];
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

  }, {
    key: 'nextPatternDate',
    value: function nextPatternDate(start, direction) {
      this.validate();
      var date = (0, _util.getString)(this._getNextOccurrence((0, _util.getDate)(start), (0, _util.normalizeDirection)(direction)));
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

  }, {
    key: 'snap',
    value: function snap(date, direction) {
      this.validate();
      return (0, _util.getString)(this._snapToOccurrence((0, _util.getDate)(date), (0, _util.normalizeDirection)(direction)));
    }
  }, {
    key: '_validatePeriod',
    value: function _validatePeriod() {
      if (!this.value.start_date) {
        throw new _InvalidPatternError2.default('A start date is required.');
      }
      this.value.start_date = String(this.value.start_date);
      (0, _util.validateDate)(this.value.start_date);
      if (this.value.end_date) {
        this.value.end_date = String(this.value.end_date);
        (0, _util.validateDate)(this.value.end_date);
        if (this.value.start_date > this.value.end_date) {
          throw new _InvalidPatternError2.default('The end date must be greater than or equal to the start date');
        }
      }
    }
  }, {
    key: '_validateType',
    value: function _validateType() {
      if (!this.value.type) {
        throw new _InvalidPatternError2.default('A recurrence type is required.');
      }
      this.value.type = Number(this.value.type);
      switch (this.value.type) {
        case _type2.default.Daily:
          this._engine = new _DailyEngine2.default(this.value);
          break;
        case _type2.default.Weekly:
          this._engine = new _WeeklyEngine2.default(this.value);
          break;
        case _type2.default.Monthly:
          this._engine = new _MonthlyEngine2.default(this.value);
          break;
        case _type2.default.MonthNth:
          this._engine = new _MonthNthEngine2.default(this.value);
          break;
        case _type2.default.Yearly:
          this._engine = new _YearlyEngine2.default(this.value);
          break;
        case _type2.default.YearNth:
          this._engine = new _YearNthEngine2.default(this.value);
          break;
        default:
          throw new _InvalidPatternError2.default('The recurrence type "' + this.value.type + '" is invalid.');
      }
    }
  }, {
    key: '_validateDayOfWeekMask',
    value: function _validateDayOfWeekMask() {
      if (this.value.type === _type2.default.Weekly || this.value.type === _type2.default.MonthNth || this.value.type === _type2.default.YearNth) {
        if (!this.value.day_of_week_mask) {
          throw new _InvalidPatternError2.default('A day of week mask is required for Weekly, MonthNth, and YearNth recurrence patterns.');
        }
        if (this.value.type === _type2.default.MonthNth || this.value.type === _type2.default.YearNth) {
          if ((0, _util.dayOfWeekFromFlag)(this.value.day_of_week_mask) % 1 !== 0) {
            throw new _InvalidPatternError2.default('Only one day of week may be specified for MonthNth and YearNth recurrence patterns.');
          }
        }
      } else {
        this.value.day_of_week_mask = null;
      }
    }
  }, {
    key: '_validateInterval',
    value: function _validateInterval() {
      if (!this.value.interval) {
        throw new _InvalidPatternError2.default('A recurrence interval is required.');
      }
      this.value.interval = Number(this.value.interval);
      if (isNaN(this.value.interval) || this.value.interval <= 0) {
        throw new _InvalidPatternError2.default('The recurrence interval must be a number greater than 0.');
      }
    }
  }, {
    key: '_validateExceptions',
    value: function _validateExceptions() {
      var _this = this;

      this._exceptionsByDate = {};
      this._exceptionsByOriginalDate = {};
      this._moved = {};
      this.value.exceptions = this.value.exceptions || [];

      this._validated = true;
      var exceptions = {};
      try {
        this.value.exceptions.forEach(function (exception) {
          if (!_this.matches(exception.original_date)) {
            throw new _InvalidPatternError2.default('An exception exists for an invalid date "' + exception.original_date + '".');
          }
          if (exceptions[exception.original_date]) {
            throw new _InvalidPatternError2.default('More than one exception exists for "' + exception.original_date + '".');
          }
          if (exception.date) {
            if (exception.date < _this.value.start_date || !!_this.value.end_date && exception.date > _this.value.end_date) {
              throw new _InvalidPatternError2.default('The exception for "' + exception.original_date + '" is outside the pattern period.');
            }
            if (exception.date !== exception.original_date && _this.matches(exception.date)) {
              throw new _InvalidPatternError2.default('The exception for "' + exception.original_date + '" cannot occur on the same date as a regular occurrence."');
            }
            if (exceptions[exception.original_date]) {
              throw new _InvalidPatternError2.default('More than one exception exists for "' + exception.original_date + '".');
            }
            if (exception.date <= _this.nextPatternDate(exception.original_date, -1)) {
              throw new _InvalidPatternError2.default('The exception for "' + exception.original_date + '" must occur after the previous occurrence.');
            }
            if (exception.date >= _this.nextPatternDate(exception.original_date, 1)) {
              throw new _InvalidPatternError2.default('The exception for "' + exception.original_date + '" must occur before the next occurrence.');
            }
          }
          exceptions[exception.original_date] = true;
        });
      } finally {
        this._validated = false;
      }

      this.value.exceptions.forEach(function (exception) {
        _this._exceptionsByOriginalDate[exception.original_date] = exception;
        if (exception.original_date !== exception.date) {
          _this._moved[exception.original_date] = true;
        }
        if (exception.date) {
          _this._exceptionsByDate[exception.date] = exception;
        }
      });
    }

    /**
     * @private
     * @param {String} date
     * @returns {Boolean}
     */

  }, {
    key: '_doesOccurWithinPeriod',
    value: function _doesOccurWithinPeriod(date) {
      return date >= this.value.start_date && (!this.value.end_date || date <= this.value.end_date);
    }

    /**
     * Gets the next valid occurrence starting from the specified date. A negative
     * direction gets the previous occurrence rather than the next.
     * @private
     * @param {Date} start The date to start from.
     * @param {Number} direction Must be 1 or -1.
     * @returns {Date}
     */

  }, {
    key: '_getNextOccurrence',
    value: function _getNextOccurrence(start, direction) {
      var occurrence = this._snapToOccurrence(start, direction);
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

  }, {
    key: '_snapToOccurrence',
    value: function _snapToOccurrence(date, direction) {
      return this._engine.snapToOccurrence(date, direction);
    }
  }]);

  return Pattern;
}();

exports.default = Pattern;
;

['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].forEach(function (month, index) {
  Pattern.prototype[month.toLowerCase()] = function (dayOfMonth) {
    this._validated = false;
    this.value.month_of_year = index + 1;
    if (dayOfMonth) {
      this.value.day_of_month = dayOfMonth;
      this.value.instance = null;
    }
    return this;
  };

  Pattern.prototype['of' + month] = function (dayOfMonth) {
    this._validated = false;
    this.value.month_of_year = index + 1;
    if (dayOfMonth) {
      this.value.day_of_month = dayOfMonth;
      this.value.instance = null;
    }
    return this;
  };
});

},{"./DailyEngine":1,"./Mask":2,"./MonthNthEngine":4,"./MonthlyEngine":5,"./WeeklyEngine":7,"./YearNthEngine":8,"./YearlyEngine":9,"./errors/InvalidOperationError":13,"./errors/InvalidPatternError":14,"./type":16,"./util":17}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _days = require('./days');

var _days2 = _interopRequireDefault(_days);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WeeklyEngine = function () {
  function WeeklyEngine(pattern) {
    _classCallCheck(this, WeeklyEngine);

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


  _createClass(WeeklyEngine, [{
    key: 'snapToOccurrence',
    value: function snapToOccurrence(date, direction) {
      while (!this._doesMatchDayOfWeek(date)) {
        date = (0, _util.plusDays)(date, direction);
      }

      var firstDay = (0, _util.getDate)(this._startDate);
      while (!this._doesMatchDayOfWeek(firstDay)) {
        firstDay = (0, _util.plusDays)(firstDay, 1);
      }
      if (date <= firstDay) {
        return firstDay;
      }

      if (this._endDate) {
        var lastDay = (0, _util.getDate)(this._endDate);
        while (!this._doesMatchDayOfWeek(lastDay)) {
          lastDay = (0, _util.plusDays)(lastDay, -1);
        }
        if (date >= lastDay) {
          return lastDay;
        }
      }

      var remainder = (0, _util.durationToWeeks)((0, _util.getSunday)(date) - (0, _util.getSunday)(firstDay)) % this._interval;
      if (remainder > 0) {
        date = (0, _util.plusWeeks)(date, remainder * direction);
        var maskDays = (0, _util.dayOfWeekMaskToArray)(this._dayOfWeekMask);
        if (direction > 0) {
          // Starting from Sunday, get the first valid date going forward from
          // Sunday to Saturday.
          return (0, _util.plusDays)((0, _util.getSunday)(date), maskDays[0]);
        } else {
          // Starting from next Sunday, get the first valid date going backward
          // from Saturday to Sunday.
          return (0, _util.plusDays)((0, _util.getSunday)((0, _util.plusWeeks)(date, 1)), -(7 - maskDays[maskDays.length - 1]));
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

  }, {
    key: 'next',
    value: function next(occurrence, direction) {
      do {
        occurrence = (0, _util.plusDays)(occurrence, direction);
        // If it's Sunday, jump to the next valid week. If the interval is 1,
        // then we're already there.
        if ((0, _util.getDayOfWeekFlag)(occurrence) === _days2.default.Sunday) {
          occurrence = (0, _util.plusWeeks)(occurrence, (this._interval - 1) * direction);
        }
      } while (!this._doesMatchDayOfWeek(occurrence));
      return occurrence;
    }

    /**
     * Gets a value indicating whether the date falls on the pattern interval.
     * @param {Date} date
     * @returns {Boolean}
     */

  }, {
    key: 'matchesInterval',
    value: function matchesInterval(date) {
      return this._doesMatchDayOfWeek(date) && this._doesMatchWeeklyInterval(date);
    }

    /**
     * @private
     * @param {Date} date
     * @returns {Boolean}
     */

  }, {
    key: '_doesMatchDayOfWeek',
    value: function _doesMatchDayOfWeek(date) {
      return (0, _util.hasFlag)(this._dayOfWeekMask, (0, _util.getDayOfWeekFlag)(date));
    }

    /**
     * @private
     * @param {Date} date
     * @returns {Boolean}
     */

  }, {
    key: '_doesMatchWeeklyInterval',
    value: function _doesMatchWeeklyInterval(date) {
      var start = (0, _util.getSunday)((0, _util.getDate)(this._startDate));
      var end = (0, _util.getSunday)(date);
      var weeks = (0, _util.durationToWeeks)(end - start);
      return weeks % this._interval === 0;
    }
  }]);

  return WeeklyEngine;
}();

exports.default = WeeklyEngine;
;

},{"./days":10,"./util":17}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

var _MonthEngine = require('./MonthEngine');

var _MonthEngine2 = _interopRequireDefault(_MonthEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var YearNthEngine = function () {
  function YearNthEngine(pattern) {
    var _this = this;

    _classCallCheck(this, YearNthEngine);

    this._dayOfWeek = (0, _util.dayOfWeekFromFlag)(pattern.day_of_week_mask);
    this._instance = pattern.instance;
    this._interval = pattern.interval;
    this._month = pattern.month_of_year;
    this._engine = new _MonthEngine2.default({
      start: pattern.start_date,
      end: pattern.end_date,
      interval: pattern.interval * 12,
      resolve: function resolve(year) {
        return (0, _util.resolveInstanceDate)(year, pattern.month_of_year, pattern.instance, _this._dayOfWeek);
      }
    });
  }

  _createClass(YearNthEngine, [{
    key: 'snapToOccurrence',
    value: function snapToOccurrence(date, direction) {
      return this._engine.snapToOccurrence(date, direction);
    }
  }, {
    key: 'next',
    value: function next(occurrence, direction) {
      return this._engine.next(occurrence, direction);
    }
  }, {
    key: 'matchesInterval',
    value: function matchesInterval(date) {
      return (0, _util.getDayOfWeek)(date) === this._dayOfWeek && (0, _util.getInstance)(date) === this._instance && (0, _util.getMonth)(date) === this._month && (0, _util.getYearsBetween)(date, this._engine.firstOccurrence) % this._interval === 0;
    }
  }]);

  return YearNthEngine;
}();

exports.default = YearNthEngine;
;

},{"./MonthEngine":3,"./util":17}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

var _MonthEngine = require('./MonthEngine');

var _MonthEngine2 = _interopRequireDefault(_MonthEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var YearlyEngine = function () {
  function YearlyEngine(pattern) {
    _classCallCheck(this, YearlyEngine);

    this._day = pattern.day_of_month;
    this._month = pattern.month_of_year;
    this._interval = pattern.interval;
    this._engine = new _MonthEngine2.default({
      start: pattern.start_date,
      end: pattern.end_date,
      interval: pattern.interval * 12,
      resolve: function resolve(year) {
        return (0, _util.resolveDate)(year, pattern.month_of_year, pattern.day_of_month);
      }
    });
  }

  _createClass(YearlyEngine, [{
    key: 'snapToOccurrence',
    value: function snapToOccurrence(date, direction) {
      return this._engine.snapToOccurrence(date, direction);
    }
  }, {
    key: 'next',
    value: function next(occurrence, direction) {
      return this._engine.next(occurrence, direction);
    }
  }, {
    key: 'matchesInterval',
    value: function matchesInterval(date) {
      return +(0, _util.resolveDate)((0, _util.getYear)(date), (0, _util.getMonth)(date), this._day) === +date && (0, _util.getMonth)(date) === this._month && (0, _util.getYearsBetween)(this._engine.firstOccurrence, date) % this._interval === 0;
    }
  }]);

  return YearlyEngine;
}();

exports.default = YearlyEngine;
;

},{"./MonthEngine":3,"./util":17}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @enum {Number}
 * Days of the week.
 */
exports.default = {
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

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var InvalidDateError = function (_extendableBuiltin2) {
  _inherits(InvalidDateError, _extendableBuiltin2);

  function InvalidDateError(message) {
    _classCallCheck(this, InvalidDateError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InvalidDateError).call(this));

    _this.name = 'InvalidDateError';
    _this.message = message;
    return _this;
  }

  return InvalidDateError;
}(_extendableBuiltin(Error));

exports.default = InvalidDateError;
;

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var InvalidMaskError = function (_extendableBuiltin2) {
  _inherits(InvalidMaskError, _extendableBuiltin2);

  function InvalidMaskError(message) {
    _classCallCheck(this, InvalidMaskError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InvalidMaskError).call(this));

    _this.name = 'InvalidMaskError';
    _this.message = message;
    return _this;
  }

  return InvalidMaskError;
}(_extendableBuiltin(Error));

exports.default = InvalidMaskError;
;

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var InvalidOperationError = function (_extendableBuiltin2) {
  _inherits(InvalidOperationError, _extendableBuiltin2);

  function InvalidOperationError(message) {
    _classCallCheck(this, InvalidOperationError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InvalidOperationError).call(this));

    _this.name = 'InvalidOperationError';
    _this.message = message;
    return _this;
  }

  return InvalidOperationError;
}(_extendableBuiltin(Error));

exports.default = InvalidOperationError;
;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var InvalidPatternError = function (_extendableBuiltin2) {
  _inherits(InvalidPatternError, _extendableBuiltin2);

  function InvalidPatternError(message) {
    _classCallCheck(this, InvalidPatternError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InvalidPatternError).call(this));

    _this.name = 'InvalidPatternError';
    _this.message = message;
    return _this;
  }

  return InvalidPatternError;
}(_extendableBuiltin(Error));

exports.default = InvalidPatternError;
;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Pattern = require('./Pattern');

var _Pattern2 = _interopRequireDefault(_Pattern);

var _Mask = require('./Mask');

var _Mask2 = _interopRequireDefault(_Mask);

var _days = require('./days');

var _days2 = _interopRequireDefault(_days);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _InvalidDateError = require('./errors/InvalidDateError');

var _InvalidDateError2 = _interopRequireDefault(_InvalidDateError);

var _InvalidMaskError = require('./errors/InvalidMaskError');

var _InvalidMaskError2 = _interopRequireDefault(_InvalidMaskError);

var _InvalidOperationError = require('./errors/InvalidOperationError');

var _InvalidOperationError2 = _interopRequireDefault(_InvalidOperationError);

var _InvalidPatternError = require('./errors/InvalidPatternError');

var _InvalidPatternError2 = _interopRequireDefault(_InvalidPatternError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _exports = function _exports() {
  return new _Pattern2.default();
};

_exports.Pattern = _Pattern2.default;
_exports.Mask = _Mask2.default;
_exports.days = _days2.default;
_exports.type = _type2.default;

_exports.errors = {
  InvalidDateError: _InvalidDateError2.default,
  InvalidMaskError: _InvalidMaskError2.default,
  InvalidOperationError: _InvalidOperationError2.default,
  InvalidPatternError: _InvalidPatternError2.default
};

exports.default = _exports;

},{"./Mask":2,"./Pattern":6,"./days":10,"./errors/InvalidDateError":11,"./errors/InvalidMaskError":12,"./errors/InvalidOperationError":13,"./errors/InvalidPatternError":14,"./type":16}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @enum {Number}
 * Recurrence types.
 */
exports.default = {
  Daily: 1,
  Weekly: 2,
  Monthly: 3,
  MonthNth: 4,
  Yearly: 5,
  YearNth: 6
};

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getDate = getDate;
exports.getDateFromParts = getDateFromParts;
exports.resolveDate = resolveDate;
exports.getInstance = getInstance;
exports.resolveInstanceDate = resolveInstanceDate;
exports.validateDate = validateDate;
exports.getString = getString;
exports.padZero = padZero;
exports.getMonth = getMonth;
exports.getDayOfMonth = getDayOfMonth;
exports.getYear = getYear;
exports.getDaysInMonth = getDaysInMonth;
exports.getFirstDayOfMonth = getFirstDayOfMonth;
exports.getDayOfWeek = getDayOfWeek;
exports.getDayOfWeekFlag = getDayOfWeekFlag;
exports.dayOfWeekToFlag = dayOfWeekToFlag;
exports.dayOfWeekFromFlag = dayOfWeekFromFlag;
exports.getSunday = getSunday;
exports.hasFlag = hasFlag;
exports.durationToDays = durationToDays;
exports.durationToWeeks = durationToWeeks;
exports.getMonthsBetween = getMonthsBetween;
exports.getYearsBetween = getYearsBetween;
exports.daysToDuration = daysToDuration;
exports.plusDays = plusDays;
exports.plusWeeks = plusWeeks;
exports.dayOfWeekMaskToArray = dayOfWeekMaskToArray;
exports.normalizeDirection = normalizeDirection;
exports.find = find;
exports.findIndex = findIndex;
exports.repeat = repeat;

var _InvalidDateError = require('./errors/InvalidDateError');

var _InvalidDateError2 = _interopRequireDefault(_InvalidDateError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DATE_PATTERN = /[0-9]{4}\-[0-9]{2}\-[0-9]{2}/;

/**
 * @param {String} date
 * @returns {Date}
 */
function getDate(date) {
  if (!DATE_PATTERN.test(date)) {
    throw new _InvalidDateError2.default('Date "' + date + '" is invalid. Expected format to be YYYY-MM-DD.');
  }
  var result = new Date(date + 'T00:00:00.000Z');
  if (isNaN(result.getTime())) {
    throw new _InvalidDateError2.default('Date "' + date + '" is invalid.');
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
function getDateFromParts(year, month, day) {
  return getDate(year + '-' + padZero(month) + '-' + padZero(day));
};

/**
 * Creates a date object from the specified year/month/day. If day is too high,
 * the last day of the month is used.
 * @param {Number} year
 * @param {Number} month [1-12]
 * @param {Number} day [1-31]
 * @returns {Date}
 */
function resolveDate(year, month, day) {
  var daysInMonth = getDaysInMonth(getDateFromParts(year, month, 1));
  return getDateFromParts(year, month, Math.min(day, daysInMonth));
};

function getInstance(date) {
  return Math.ceil(getDayOfMonth(date) / 7);
};

/**
 * @param {Number} year
 * @param {Number} month
 * @param {Number} instance [1-5]
 * @param {Number} dayOfWeek [0-6]
 * @returns {Date}
 */
function resolveInstanceDate(year, month, instance, dayOfWeek) {
  var day0 = getDateFromParts(year, month, 1);
  var dow0 = getDayOfWeek(day0);
  if (dayOfWeek < dow0) {
    dayOfWeek += 7;
  }
  var firstInstance = 1 + dayOfWeek - dow0;
  var day = firstInstance + (instance - 1) * 7;
  var daysInMonth = getDaysInMonth(day0);
  if (day > daysInMonth) {
    day -= 7;
  }
  return getDateFromParts(year, month, day);
};

/**
 * @param {String} date
 */
function validateDate(date) {
  getDate(date);
};

/**
 * @param {Date} date
 * @returns {String}
 */
function getString(date) {
  var month = padZero(getMonth(date));
  var day = padZero(getDayOfMonth(date));
  return date.getUTCFullYear() + '-' + month + '-' + day;
};

function padZero(value) {
  value = value.toString();
  if (value.length === 1) {
    value = '0' + value;
  }
  return value;
};

function getMonth(date) {
  return date.getUTCMonth() + 1;
};

function getDayOfMonth(date) {
  return date.getUTCDate();
};

function getYear(date) {
  return date.getUTCFullYear();
};

function getDaysInMonth(date) {
  var year = getYear(date);
  var month = getMonth(date) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  date = getDate(year + '-' + padZero(month) + '-01');
  date = plusDays(date, -1);
  return getDayOfMonth(date);
};

function getFirstDayOfMonth(date) {
  var _getString$split = getString(date).split('-');

  var _getString$split2 = _slicedToArray(_getString$split, 3);

  var year = _getString$split2[0];
  var month = _getString$split2[1];
  var day = _getString$split2[2];

  return getDate(year + '-' + month + '-01');
};

/**
 * 0-6 Sunday-Saturday.
 * @param {Date} date
 * @returns {Number}
 */
function getDayOfWeek(date) {
  return date.getUTCDay();
};

/**
 * @param {Date} date
 * @returns {Number}
 */
function getDayOfWeekFlag(date) {
  return dayOfWeekToFlag(getDayOfWeek(date));
};

/**
 * @param {Number} day
 * @returns {Number}
 */
function dayOfWeekToFlag(day) {
  return Math.pow(2, day);
};

/**
 * @param {Number} flag
 * @returns {Number}
 */
function dayOfWeekFromFlag(flag) {
  return Math.log(flag) / Math.log(2);
};

/**
 * @param {Date} date
 * @returns {Date}
 */
function getSunday(date) {
  return plusDays(date, -getDayOfWeek(date));
};

/**
 * Determines whether a given bit mask contains the specified bit flag.
 * @param {Number} mask
 * @param {Number} flag
 * @returns {Boolean}
 */
function hasFlag(mask, flag) {
  return (mask & flag) === flag;
};

/**
 * Converts a JavaScript date value to days.
 * @param {Number} value
 *   The number of milliseconds since midnight of Jan 1, 1970 UTC.
 * @returns {Number}
 */
function durationToDays(duration) {
  return +duration / 1000 / 60 / 60 / 24;
};

/**
 * @param {Number} duration
 * @returns {Number}
 */
function durationToWeeks(duration) {
  return durationToDays(duration) / 7;
};

function getMonthsBetween(start, end) {
  if (start > end) {
    var temp = end;
    end = start;
    start = temp;
  }
  var startYear = getYear(start);
  var startMonth = getMonth(start);
  var endYear = getYear(end);
  var endMonth = getMonth(end);
  var years = endYear - startYear;
  var months = 0;
  if (endMonth > startMonth) {
    months = endMonth - startMonth;
  } else if (endMonth < startMonth) {
    months = startMonth - endMonth;
    years -= 1;
  }
  months += years * 12;
  return months;
};

function getYearsBetween(start, end) {
  return Math.abs(getYear(end) - getYear(start));
};

/**
 * @param {Number} days
 * @returns {Number}
 */
function daysToDuration(days) {
  return days * 24 * 60 * 60 * 1000;
};

/**
 * @param {Date} date
 * @param {Number} days
 * @returns {Date}
 */
function plusDays(date, days) {
  return new Date(+date + daysToDuration(days));
};

/**
 * @param {Date} date
 * @param {Number} weeks
 * @returns {Date}
 */
function plusWeeks(date, weeks) {
  return plusDays(date, weeks * 7);
};

/**
 * @param {Number} mask
 * @returns {Array.<Number>}
 */
function dayOfWeekMaskToArray(mask) {
  var days = [0, 1, 2, 3, 4, 5, 6];
  var result = [];
  days.forEach(function (day) {
    if (hasFlag(mask, dayOfWeekToFlag(day))) {
      result.push(day);
    }
  });
  return result;
};

function normalizeDirection(direction) {
  return direction < 0 ? -1 : 1;
};

function find(array, callback) {
  var index = findIndex(array, callback);
  if (index > -1) {
    return array[index];
  } else {
    return null;
  }
};

function findIndex(array, callback) {
  for (var i = 0; i < array.length; i++) {
    if (callback(array[i])) {
      return i;
    }
  }
  return -1;
};

function repeat(string, times) {
  var ret = '';
  for (var i = 0; i < times; i++) {
    ret += string;
  }
  return ret;
};

},{"./errors/InvalidDateError":11}]},{},[15])(15)
});
//# sourceMappingURL=dialga.js.map?55562f87148c25e14a0ca47ebe954b7bd1f982d1
