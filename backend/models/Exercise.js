const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    exerciseName: {
        type: String,
        required: true
    },
    repetitions: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    progress: {
        type: String, // e.g., "Completed", "In Progress", "Skipped"
        default: "In Progress"
    },
    therapistNotes: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("Exercise", ExerciseSchema);
