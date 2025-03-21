const mongoose = require("mongoose");

const UserExerciseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }], // Selected exercises
    progress: [{
        exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },// ✅ Added userId for better tracking
        completedReps: { type: Number, default: 0 },
        completedSets: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model("UserExercise", UserExerciseSchema);
