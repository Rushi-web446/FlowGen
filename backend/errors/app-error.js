class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource") {
    super(message, 403, "FORBIDDEN");
  }
}

module.exports = { AppError, NotFoundError, ForbiddenError };
