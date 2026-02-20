import winston from "winston";
import fs from "fs";
import path from "path";

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Console format with colors and timestamps
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ""}`;
  })
);

// File format with JSON structure
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: "info",
  format: fileFormat,
  transports: [
    // Error log file - only errors
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    // Combined log file - all logs
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export default logger;