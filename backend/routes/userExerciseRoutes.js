const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { addUserExercise, getUserExercises, updateProgress } = require("../controllers/userExerciseController");

// 🟢 Add an exercise to the user's list
router.post("/add", protect, addUserExercise);

// 🟢 Get all exercises added by the user
router.get("/", protect, getUserExercises);

// 🟢 Update exercise progress
router.put("/progress", protect, updateProgress);

module.exports = router;
