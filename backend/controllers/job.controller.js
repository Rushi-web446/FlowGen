const { enqueueLessonGeneration, getJobStatus, queueEvents } = require("../services/job.service");
const { findLessonForUser } = require("../repository/course.repository");
const Module = require("../models/module");

const createLessonJob = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const lesson = await findLessonForUser({ lessonId, userId: req.appUser._id });
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });
    const module = await Module.findById(lesson.module).select("course").lean();
    const { job, reused } = await enqueueLessonGeneration({ courseId: module.course.toString(), moduleId: lesson.module.toString(), lessonId, idempotencyKey: req.get("Idempotency-Key") });
    return res.status(reused ? 200 : 202).json({ success: true, jobId: job.id, reused, statusUrl: `/course/jobs/${job.id}` });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};
const readJob = async (req, res) => {
  const job = await getJobStatus(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, message: "Job not found" });
  res.json({ success: true, job });
};
const streamJob = async (req, res) => {
  const jobId = req.params.jobId;
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  const send = async () => { const job = await getJobStatus(jobId); res.write(`data: ${JSON.stringify(job)}\n\n`); if (["completed", "failed"].includes(job?.state)) cleanup(); };
  const onProgress = ({ jobId: changed }) => { if (changed === jobId) send(); };
  const onCompleted = ({ jobId: changed }) => { if (changed === jobId) send(); };
  const onFailed = ({ jobId: changed }) => { if (changed === jobId) send(); };
  const cleanup = () => { queueEvents.off("progress", onProgress); queueEvents.off("completed", onCompleted); queueEvents.off("failed", onFailed); res.end(); };
  queueEvents.on("progress", onProgress); queueEvents.on("completed", onCompleted); queueEvents.on("failed", onFailed); req.on("close", cleanup); send();
};
module.exports = { createLessonJob, readJob, streamJob };
