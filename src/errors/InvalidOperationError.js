export default class InvalidOperationError extends Error {
  constructor( message ) {
    super();
    this.name = 'InvalidOperationError';
    this.message = message;
  }
};
