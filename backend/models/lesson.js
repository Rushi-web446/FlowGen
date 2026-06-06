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