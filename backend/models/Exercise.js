const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    category: { type: String, required: true }, // Example: "Upper Body", "Lower Body"
    videoUrl: { type: String }, // Optional: Video guide for exercise
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Admin who created it
});

module.exports = mongoose.model("Exercise", ExerciseSchema);
