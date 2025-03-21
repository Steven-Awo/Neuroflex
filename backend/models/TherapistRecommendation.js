const mongoose = require("mongoose");

const TherapistRecommendationSchema = new mongoose.Schema({
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }]
});

module.exports = mongoose.model("TherapistRecommendation", TherapistRecommendationSchema);
