const mongoose = require("mongoose");

const tutorMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  citations: [{ title: String, url: String, sourceId: mongoose.Schema.Types.ObjectId }],
  followUpQuiz: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

module.exports = mongoose.model("TutorMessage", tutorMessageSchema);
