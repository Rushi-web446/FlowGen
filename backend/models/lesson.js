const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    lessonIndex: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    realWorldProblem: {
      type: String,
      required: true,
    },

    learnerTakeaway: {
      type: String,
      required: true,
    },

    completionCriteria: {
      type: String,
      required: true,
    },

    briefDescription: {
      type: String,
      required: true,
    },

    estimatedMinutes: {
      type: Number,
      min: 5,
      default: 30,
    },

    skillTags: [{ type: String, trim: true }],

    handsOnTask: {
      title: { type: String, trim: true },
      instructions: String,
      deliverable: String,
    },

    resources: [{
      title: { type: String, trim: true },
      type: { type: String, trim: true },
      url: { type: String, trim: true },
    }],

    retrievalCitations: [{
      sourceId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeSource" },
      title: String,
      url: String,
    }],

    content: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    hinglishContent: {
      type: String,
      default: "",
    },

    isGenerated: {
      type: String,
      enum: [
        "PENDING",
        "GENERATING",
        "GENERATED",
        "FAILED",
      ],
      default: "PENDING",
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    quizScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },

    youtubeQuery: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({
  module: 1,
  lessonIndex: 1,
});

module.exports = mongoose.model(
  "Lesson",
  lessonSchema
);
