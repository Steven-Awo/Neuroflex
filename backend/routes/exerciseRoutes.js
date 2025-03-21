const express = require("express");
const router = express.Router();
const { protect, adminOnly, therapistOnly } = require("../middleware/authMiddleware");

const {
    createExercise,
    deleteExercise,
    getAllExercises,
    selectExercise,
    getUserExercises,
    updateExerciseProgress,
    recommendExercise,             // ✅ Add this
    getRecommendationsForUser,     // ✅ Add this too
    assignExerciseToUser,  // ✅ NEW: Therapists can assign exercises to users
    getAssignedExercises   // ✅ NEW: Users can view their assigned exercises
} = require("../controllers/exerciseController");

// ===============================
// 🔹 ADMIN ROUTES (Only Admins)
// ===============================

// 🟢 Admin creates an exercise
router.post("/create", protect, adminOnly, createExercise);

// 🟢 Admin deletes an exercise
router.delete("/:id", protect, adminOnly, deleteExercise);

// ===============================
// 🔹 PUBLIC ROUTES (Accessible to All Users)
// ===============================

// 🟢 Get all exercises (authentication required)
router.get("/", protect, getAllExercises);

// ===============================
// 🔹 USER ROUTES (Only Authenticated Users)
// ===============================

// 🟢 User selects an exercise
router.post("/select", protect, selectExercise);

// 🟢 User views their selected exercises
router.get("/user", protect, getUserExercises);

// 🟢 User updates progress
router.put("/progress", protect, updateExerciseProgress);

// 🟢 User views assigned exercises
router.get("/assigned", protect, getAssignedExercises);

// ===============================
// 🔹 THERAPIST ROUTES (Only Therapists)
// ===============================

// 🟢 Therapist recommends an exercise
router.post("/recommend", protect, therapistOnly, recommendExercise);

// 🟢 Therapist assigns exercises to a user
router.post("/assign", protect, therapistOnly, assignExerciseToUser);




// ✅ Get recommendations for a user (used by AI or patient)
router.get("/recommendations/:userId", protect, getRecommendationsForUser);


module.exports = router;
