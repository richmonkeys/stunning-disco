interface ServerErrorOptions {
  code?: number | string
  data?: any
}

class ServerError extends Error {
  name = 'ServerError'
  status = 500
  message: string
  code?: number | string
  data?: any
  constructor(message = 'Server Error.', options?: ServerErrorOptions) {
    super(message)
    this.message = message
    this.code = options?.code
    this.data = options?.data
  }
}

class BadRequestError extends ServerError {
  name = 'BadRequestError'
  status = 400
  constructor(message = 'Bad request.', options?: ServerErrorOptions) {
    super(message, options)
  }
}

class UnauthorizedError extends ServerError {
  name = 'UnauthorizedError'
  status = 401
  constructor(message = 'Unauthorized.', options?: ServerErrorOptions) {
    super(message, options)
  }
}

class ForbiddenError extends ServerError {
  name = 'ForbiddenError'
  status = 403
  constructor(message = 'Forbidden.', options?: ServerErrorOptions) {
    super(message, options)
  }
}

class NotFoundError extends ServerError {
  name = 'NotFoundError'
  status = 404
  constructor(message = 'Not found.', options?: ServerErrorOptions) {
    super(message, options)
  }
}

class MethodNotAllowedError extends ServerError {
  name = 'MethodNotAllowedError'
  status = 405
  constructor(message = 'Method not allowed.', options?: ServerErrorOptions) {
    super(message, options)
  }
}

class ConflictError extends ServerError {
  name = 'ConflictError'
  status = 409
  constructor(message = 'Conflict.', options?: ServerErrorOptions) {
    super(message, options)
  }
}

class RateLimitError extends ServerError {
  name = 'RateLimitError'
  status = 429
  constructor(message = 'Too Many Requests.', options?: ServerErrorOptions) {
    super(message, options)
  }
}

class InternalError extends ServerError {
  name = 'InternalError'
  status = 500
  constructor(message = 'Internal error.', options?: ServerErrorOptions) {
    super(message, options)
  }
}

export {
  ServerError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  ConflictError,
  RateLimitError,
  InternalError,
}