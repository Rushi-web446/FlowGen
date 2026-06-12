const express = require("express");
const router = express.Router();
const {
  getQueueStats,
  reprocessDlqJob,
  clearQueue,
} = require("../controllers/queue.controller");

// Get queue stats
router.get("/stats", getQueueStats);

// Reprocess DLQ job
router.post("/dlq/:jobId/reprocess", reprocessDlqJob);

// Clear queue
router.delete("/", clearQueue);

module.exports = router;
