const mongoose = require("mongoose");

/* ---------- Lesson Schema ---------- */
const lessonSchema = new mongoose.Schema(
  {
    lessonIndex: { type: Number, required: true },

    title: { type: String, required: true },
    lessonObjective: { type: String },
    briefDescription: { type: String, required: true },

    // AI-generated lesson JSON (STRICT schema from your lesson prompt)
    content: {
      type: mongoose.Schema.Types.Mixed, // stores validated AI JSON
      default: null,
    },

    isGenerated: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: true }
);

/* ---------- Module Schema ---------- */
const moduleSchema = new mongoose.Schema(
  {
    moduleIndex: { type: Number, required: true },
    recommendedOrder: { type: Number, required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },

    moduleObjective: { type: String, required: true },
    difficultyLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },




    topics: [{ type: String }], // outline-level topics (titles only)

    lessons: [lessonSchema],

    isCompleted: { type: Boolean, default: false },
  },
  { _id: true }
);

/* ---------- Course Schema ---------- */
const courseSchema = new mongoose.Schema(
  {
    /* ----- Course Metadata ----- */
    title: { type: String, required: true },
    description: { type: String, required: true },

    courseObjective: { type: String, required: true },



    /* ----- Modules ----- */
    modules: [moduleSchema],

    /* ----- Ownership ----- */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ----- Progress & Tracking ----- */
    lastAccessedAt: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);










// const mongoose = require("mongoose");

// // Lesson Schema
// const lessonSchema = new mongoose.Schema(
//   {
//     lessonIndex: { type: Number, required: true },

//     title: { type: String, required: true },
//     lessonObjective: { type: String },
//     description: { type: String, required: true },
//     introduction:{type:String, required:true},
//     videoQuery:{type:string},
//     mainPoints:[{type:Object}],
//     examples:[{type:Object}],
//     mcqs:[{type:Object}],
//     summary:{type:string},
//     external:{type:string},
//     isGenerated: { type: Boolean, default: false },
//     isCompleted: { type: Boolean, default: false },
//   },
//   { _id: true }
// );

// // Module Schema
// const moduleSchema = new mongoose.Schema(
//   {
//     moduleIndex: { type: Number, required: true },
//     recommendedOrder: { type: Number, required: true },

//     title: { type: String, required: true },
//     description: { type: String, required: true },

//     moduleObjective: { type: String, required: true },
//     difficultyLevel: {
//       type: String,
//       enum: ["Beginner", "Intermediate", "Advanced"],
//       required: true,
//     },

//     topics: [{ type: String }],

//     lessons: [lessonSchema],

//     isCompleted: { type: Boolean, default: false },
//   },
//   { _id: true }
// );

// // Course Schema
// const courseSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, required: true },

//     courseObjective: { type: String, required: true },



//     modules: [moduleSchema],

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     lastAccessedAt: { type: Date, default: Date.now },
//     isCompleted: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Course", courseSchema);