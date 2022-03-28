const logger = require("pino")({
  level: process.env.LOG_LEVEL || "warn", // Use warn level if no log level is defined in env
  useOnlyCustomLevels: true,
  // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md#field-severitynumber
  customLevels: {
    fatal: 21,
    error: 17,
    warn: 13,
    info: 9,
    debug: 5,
    trace: 1,
  },
});

const expressLoggerMiddleware = require("pino-http")({
  logger,
  autoLogging: process.env.AUTO_LOG == "true",
});

module.exports = { expressLoggerMiddleware, logger };
