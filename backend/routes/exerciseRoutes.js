const express = require("express");
const router = express.Router();
const Exercise = require("../models/Exercise");
const { protect } = require("../middlewares/authMiddleware");

// 📌 Add a new exercise session (Protected Route)
router.post("/add", protect, async (req, res) => {
    const { exerciseName, repetitions } = req.body;

    try {
        const exercise = new Exercise({
            userId: req.user.id,
            exerciseName,
            repetitions
        });

        await exercise.save();
        res.json({ message: "Exercise recorded", exercise });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// 📌 Get user’s exercise history
router.get("/history", protect, async (req, res) => {
    try {
        const exercises = await Exercise.find({ userId: req.user.id });
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// 📌 Update exercise progress
router.put("/update/:id", protect, async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);

        if (!exercise) {
            return res.status(404).json({ message: "Exercise not found" });
        }

        exercise.progress = req.body.progress || exercise.progress;
        exercise.therapistNotes = req.body.therapistNotes || exercise.therapistNotes;

        await exercise.save();
        res.json({ message: "Exercise updated", exercise });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

module.exports = router;
