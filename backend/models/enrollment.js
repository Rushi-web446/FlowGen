const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseTemplate", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  progress: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    completedAt: Date,
    quizScore: { type: Number, min: 0, max: 100 },
  }],
}, { timestamps: true });

enrollmentSchema.index({ userId: 1, templateId: 1 }, { unique: true });
module.exports = mongoose.model("Enrollment", enrollmentSchema);
