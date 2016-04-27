import Pattern from './Pattern';
import Mask from './Mask';
import days from './days';
import type from './type';

import InvalidDateError from './errors/InvalidDateError';
import InvalidMaskError from './errors/InvalidMaskError';
import InvalidOperationError from './errors/InvalidOperationError';
import InvalidPatternError from './errors/InvalidPatternError';

var exports = function() {
  return new Pattern();
};

exports.Pattern = Pattern;
exports.Mask = Mask;
exports.days = days;
exports.type = type;

exports.errors = {
  InvalidDateError,
  InvalidMaskError,
  InvalidOperationError,
  InvalidPatternError,
};

export default exports;
