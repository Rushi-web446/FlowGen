const mongoose = require("mongoose");

// Module Schema 
const moduleSchema = new mongoose.Schema(
    {
        moduleIndex: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },

        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },


        lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]

    },
    { _id: true }
);

module.exports = mongoose.model("Module", moduleSchema);