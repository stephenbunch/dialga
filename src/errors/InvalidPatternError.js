export default class InvalidPatternError extends Error {
  constructor(message) {
    super();
    this.name = 'InvalidPatternError';
    this.message = message;
  }
};
