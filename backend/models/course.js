const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module"
      }
    ],

    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseTemplate",
      default: null,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },


    // =========================
    // AI Intent Metadata
    // =========================

    learningIntent: {
      topic: {
        type: String,
        required: true,
        index: true,
      },

      goal: {
        type: String,
        index: true,
      },

      level: {
        type: String,
        enum: [
          "Beginner",
          "Intermediate",
          "Advanced",
        ],
      },

      targetRole: {
        type: String,
      },

      canonicalQuery: {
        type: String,
        required: true,
        index: true,
      },

      confidence: {
        type: Number,
      },
    },

    // =========================
    // Vector Embedding
    // =========================

    embedding: {
      type: [Number],
      required: true,
    },

    // =========================
    // Reusability Tracking
    // =========================

    usageCount: {
      type: Number,
      default: 1,
    },

    generatedFromPrompt: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "GENERATING",
        "READY",
        "FAILED",
      ],
      default: "READY",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Course", courseSchema);
