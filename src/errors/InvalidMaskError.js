export default class InvalidMaskError extends Error {
  constructor( message ) {
    super();
    this.name = 'InvalidMaskError';
    this.message = message;
  }
};
