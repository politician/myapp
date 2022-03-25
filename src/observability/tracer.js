const opentelemetry = require("@opentelemetry/sdk-node");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");
const { PinoInstrumentation } = require("@opentelemetry/instrumentation-pino");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || "myapp",
  }),
  instrumentations: [
    new HttpInstrumentation({
      // Soon replaced by ignoreIncomingRequestHook
      // https://github.com/open-telemetry/opentelemetry-js/blob/549bd5b9f82ab4f580fcfecb5416b5b645ed32ee/experimental/packages/opentelemetry-instrumentation-http/test/functionals/https-enable.test.ts#L195-L197
      ignoreIncomingPaths: ["/metrics", "/livez", "/readyz"],
    }),
    new ExpressInstrumentation(),
    new PinoInstrumentation(),
  ],
  traceExporter: new JaegerExporter(),
});

sdk.start();
