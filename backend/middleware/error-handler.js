const { ZodError } = require("zod");
const logger = require("../config/logger");

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} was not found`,
      requestId: req.id,
    },
  });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const statusCode = error.statusCode || (error instanceof ZodError ? 400 : 500);
  const code = error.code || (error instanceof ZodError ? "VALIDATION_ERROR" : "INTERNAL_ERROR");

  logger.error({ err: error, requestId: req.id, statusCode }, "Request failed");

  res.status(statusCode).json({
    error: {
      code,
      message: statusCode >= 500 ? "Internal server error" : error.message,
      requestId: req.id,
    },
  });
};

module.exports = { errorHandler, notFoundHandler };
