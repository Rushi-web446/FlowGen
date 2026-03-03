const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    lessonIndex: { type: Number, required: true },
    title: { type: String, required: true },
    briefDescription: { type: String, required: true },

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
      enum: ["", "PENDING", "GENERATING", "GENERATED", "FAILED"],
      default: "PENDING",
    },

    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// compound index for faster queries
lessonSchema.index({ module: 1, _id: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);