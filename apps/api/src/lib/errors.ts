export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly fieldErrors?: Record<string, string[] | undefined>;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', fieldErrors?: Record<string, string[] | undefined>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  static badRequest(message: string, fieldErrors?: Record<string, string[] | undefined>) {
    return new AppError(message, 400, 'BAD_REQUEST', fieldErrors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new AppError(message, 409, 'CONFLICT');
  }
}
