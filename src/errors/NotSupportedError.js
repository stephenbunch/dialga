export default class NotSupportedError extends Error {
  constructor( message ) {
    super();
    this.name = 'NotSupportedError';
    this.message = message;
  }
};
