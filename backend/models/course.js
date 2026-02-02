const mongoose = require("mongoose");

 // Lesson Schema
const lessonSchema = new mongoose.Schema(
  {
    lessonIndex: { type: Number, required: true },
    title: { type: String, required: true },
    lessonObjective: { type: String },
    briefDescription: { type: String, required: true },

    content: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isGenerated: {
      type: String,
      enum: ["", "PENDING", "GENERATING", "GENERATED", "FAILED"],
      default: ""
    },

    isCompleted: { type: Boolean, default: false },
  },
  { _id: true }
);

// Module Schema 
const moduleSchema = new mongoose.Schema(
  {
    moduleIndex: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },

    moduleObjective: { type: String, required: true },

    topics: [{ type: String }],

    lessons: [lessonSchema],

    isCompleted: { type: Boolean, default: false },
  },
  { _id: true }
);

 // Course Schema
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    courseObjective: { type: String, required: true },


    modules: [moduleSchema],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lastAccessedAt: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);