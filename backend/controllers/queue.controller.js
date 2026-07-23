const {
  lessonGenerationQueue,
  lessonGenerationDeadLetterQueue,
} = require("../queues");

/**
 * Get queue statistics
 */
const getQueueStats = async (req, res) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      lessonGenerationQueue.getWaitingCount(),
      lessonGenerationQueue.getActiveCount(),
      lessonGenerationQueue.getCompletedCount(),
      lessonGenerationQueue.getFailedCount(),
    ]);

    const dlqCount = await lessonGenerationDeadLetterQueue.getJobCounts();

    res.json({
      success: true,
      stats: {
        lessonGeneration: {
          waiting,
          active,
          completed,
          failed,
        },
        dlq: dlqCount,
      },
    });
  } catch (error) {
    console.error("Failed to get queue stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const inspectDlq = async (req, res) => {
  try {
    const jobs = await lessonGenerationDeadLetterQueue.getJobs(["waiting", "delayed", "failed"], 0, 50, true);
    res.json({ success: true, jobs: jobs.map((job) => ({ id: job.id, name: job.name, data: job.data, failedReason: job.failedReason, timestamp: job.timestamp })) });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

/**
 * Reprocess a failed DLQ job
 */
const reprocessDlqJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get job from DLQ
    const dlqJobs = await lessonGenerationDeadLetterQueue.getJobs(["waiting"]);
    const jobToReprocess = dlqJobs.find(j => j.id === jobId || j.data.prevJobId === jobId);

    if (!jobToReprocess) {
      return res.status(404).json({
        success: false,
        error: "Job not found in DLQ",
      });
    }

    // Re-add to main queue
    await lessonGenerationQueue.add(
      "GENERATE_LESSON",
      jobToReprocess.data,
      {
        jobId: `reprocessed-${Date.now()}-${jobId}`,
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      }
    );

    // Remove from DLQ
    await jobToReprocess.remove();

    res.json({
      success: true,
      message: "Job reprocessed successfully",
    });
  } catch (error) {
    console.error("Failed to reprocess DLQ job:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Clear all jobs from queue
 */
const clearQueue = async (req, res) => {
  try {
    await lessonGenerationQueue.drain();
    await lessonGenerationQueue.obliterate({ force: true });

    res.json({
      success: true,
      message: "Queue cleared successfully",
    });
  } catch (error) {
    console.error("Failed to clear queue:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getQueueStats,
  inspectDlq,
  reprocessDlqJob,
  clearQueue,
};
