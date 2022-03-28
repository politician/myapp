const express = require("express");
const { getSummary, getContentType } = require("@promster/express");
const { logger } = require("./logger.js");

const router = express.Router();
router.get("/metrics", async (req, res) => {
  logger.debug("Metrics request received");
  try {
    req.statusCode = 200;
    res.setHeader("Content-Type", getContentType());
    res.end(await getSummary());
  } catch (err) {
    req.log.error(err);
    res.status(500).end(err);
  }
});

module.exports = router;
