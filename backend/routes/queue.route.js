const express = require("express");
const router = express.Router();
const {
  getQueueStats,
  inspectDlq,
  reprocessDlqJob,
} = require("../controllers/queue.controller");

// Get queue stats
router.get("/stats", getQueueStats);
router.get("/dlq", inspectDlq);

// Reprocess DLQ job
router.post("/dlq/:jobId/reprocess", reprocessDlqJob);

module.exports = router;
