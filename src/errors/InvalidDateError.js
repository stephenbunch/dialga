export default class InvalidDateError extends Error {
  constructor( message ) {
    super();
    this.name = 'InvalidDateError';
    this.message = message;
  }
};
