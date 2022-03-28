const { createTerminus } = require("@godaddy/terminus");
const { logger } = require("./logger");
const tracer = require("./tracer");

function readinessCheck({ state }) {
  logger.debug(`Readiness request received`);
  const errors = [];
  return Promise.all(
    [
      /*
       * All your health checks go here
       * Test db connections, 3rd party integrations, etc.
       */
    ].map((p) =>
      p.catch((error) => {
        errors.push(error);
        return undefined;
      })
    )
  ).then(() => {
    if (errors.length) {
      throw new HealthCheckError("Not ready", errors);
    }
  });
}

// Clean up before closing the HTTP server
// The server should not be receiving traffic at this stage (see SHUTDOWN_DELAY)
function onSignal() {
  logger.debug(`HTTP server is starting to clean up`);
  return Promise.all([
    /*
     * All your graceful DB connections closing, de-registering, etc. go here
     */
    tracer.shutdown().then(
      () => console.log("OpenTelemetry SDK shut down successfully"),
      (err) => console.log("Error shutting down SDK", err)
    ),
  ]);
}

// Most likely, you don't need to change the below
const healthOptions = {
  logger: (msg, err) => logger.error(err),
  healthChecks: {
    verbatim: true,
    "/readyz": readinessCheck, // In k8s, not ready = k8s stops sending traffic to container
    "/livez": ({ state }) => {
      // In k8s, not live = k8s restarts container
      logger.debug(`Liveness request received`);
      return Promise.resolve();
    },
  },

  beforeShutdown: () => {
    // https://github.com/godaddy/terminus#how-to-set-terminus-up-with-kubernetes
    const timeout = process.env.SHUTDOWN_DELAY || 11;
    logger.info(`SIGTERM signal received: Closing HTTP server in ${timeout}s`);
    return new Promise((resolve) => {
      setTimeout(resolve, timeout * 1000);
    });
  },
  onSignal,
  onShutdown: () => {
    logger.info(`HTTP server closed`);
  },
};

module.exports = function healthChecker(server) {
  return createTerminus(server, healthOptions);
};
