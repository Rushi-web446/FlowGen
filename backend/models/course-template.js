const mongoose = require("mongoose");

const courseTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  learningIntent: { type: mongoose.Schema.Types.Mixed, default: {} },
  outline: { type: mongoose.Schema.Types.Mixed, required: true },
  embedding: { type: [Number], default: [] },
  version: { type: Number, default: 1 },
  status: { type: String, enum: ["READY", "ARCHIVED"], default: "READY" },
}, { timestamps: true });

courseTemplateSchema.index({ "learningIntent.canonicalQuery": 1 });
module.exports = mongoose.model("CourseTemplate", courseTemplateSchema);
