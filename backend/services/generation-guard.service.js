const GenerationUsage = require("../models/generation-usage");

const blockedPatterns = [/\b(hate|kill|suicide|self-harm)\b/i, /\b(password|api[_ -]?key|secret)\b/i];
const assertSafeContent = (value) => {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (blockedPatterns.some((pattern) => pattern.test(text))) throw new Error("Generated content failed safety review");
  return value;
};

const validateLesson = (lesson) => {
  if (!lesson || typeof lesson !== "object") throw new Error("Lesson response must be an object");
  const required = ["opening", "coreExplanation", "mcqs", "closing"];
  if (!required.every((key) => lesson[key])) throw new Error("Lesson response is missing required sections");
  if (!Array.isArray(lesson.mcqs) || lesson.mcqs.length !== 3) throw new Error("Lesson response must include exactly three MCQs");
  return lesson;
};

const recordUsage = async (data) => {
  try { await GenerationUsage.create(data); } catch (error) { console.warn("Could not record generation usage:", error.message); }
};

module.exports = { assertSafeContent, validateLesson, recordUsage };
