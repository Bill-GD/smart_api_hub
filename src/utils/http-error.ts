import HttpStatus from './http-status';

export class HttpError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends HttpError {
  constructor(tableName: string, id: string) {
    super(HttpStatus.NOT_FOUND, `Resource "${tableName}" with ID=${id} doesn't exist`);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(HttpStatus.FORBIDDEN, message);
  }
}
