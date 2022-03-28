// Observability
const tracer = require("./observability/tracer").start();
const { expressLoggerMiddleware, logger } = require("./observability/logger");
const expressMeterRouter = require("./observability/meter");
const healthChecker = require("./observability/health");

// Express server
const http = require("http");
const express = require("express");
const { notFoundHandler, errorHandler } = require("./errorHandler");
const { createMiddleware } = require("@promster/express");

try {
  const port = process.env.PORT || 3000;
  const app = express();

  app.use(createMiddleware({ app }));
  app.use(expressLoggerMiddleware);
  app.use(expressMeterRouter);

  app.get("/", (req, res) => {
    req.log.info("Visited homepage");
    res.send(`Hello world!`);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  // Create express server
  const server = healthChecker(http.createServer(app));

  server.listen(port, () => {
    logger.info(`App listening on port ${port}!`);
  });
} catch (e) {
  logger.error(e);
}
