export default class CustomError extends Error {
  readonly name = "CustomError";
  constructor(message: string, readonly error_code: number) {
    super(message);
  }
}
