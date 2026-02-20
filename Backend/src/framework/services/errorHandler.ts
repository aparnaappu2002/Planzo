import { Request, Response } from "express";
import logger from "./logger";
import { HttpStatus } from "../../domain/enums/httpStatus";
import { Messages } from "../../domain/enums/messages";
// Custom error class for application-specific errors
export class CustomError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler function
export const handleErrorResponse = (
  req: Request,
  res: Response,
  error: unknown,
  customMessage?: string
): void => {
  // Extract error details
  const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Log error with request context
  logger.error(`[${req.method}] ${req.url} - ${errorMessage}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    body: req.body,
    params: req.params,
    query: req.query,
    stack: errorStack,
  });

  // Console log in development
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ Error:", error);
  }

  // Handle CustomError
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: errorMessage,
    });
    return;
  }

  // Handle generic errors
  const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  const message = customMessage || Messages.SERVER_ERROR || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    error: errorMessage,
  });
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<void>
) => {
  return (req: Request, res: Response): void => {
    Promise.resolve(fn(req, res)).catch((error) => {
      handleErrorResponse(req, res, error);
    });
  };
};

// Logger helper functions for different log levels
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: any) => {
  logger.error(message, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
  });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};