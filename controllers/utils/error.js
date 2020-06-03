// eslint-disable-next-line max-classes-per-file
const HttpCodes = Object.freeze({
  Success: 200,
  NotModified: 304,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  InternalServerError: 500,
  ServiceUnavailable: 503
});

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.code = HttpCodes.BadRequest;
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line no-unused-vars
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.code = HttpCodes.Forbidden;
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line no-unused-vars
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.code = HttpCodes.Unauthorized;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.code = HttpCodes.NotFound;
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line no-unused-vars
class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.code = HttpCodes.ServiceUnavailable;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  HttpCodes,
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,
  ServiceUnavailableError
};
