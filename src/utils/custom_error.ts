export default class CustomError extends Error {
  constructor(readonly message: string, readonly error_code: number) {
    super(message);
  }
}
