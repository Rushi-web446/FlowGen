const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    moduleIndex: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
      }
    ],

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Module",
  moduleSchema
);