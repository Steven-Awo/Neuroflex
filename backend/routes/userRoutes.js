const express = require("express");
const { protect, authorizeRoles, therapistOnly } = require("../middleware/authMiddleware"); // ✅ Ensure this import is correct!
const { toggleConnectionPreference } = require("../controllers/userController");
const { getTherapistPatients, getTherapistDashboard } = require("../controllers/therapistController");

const router = express.Router();

router.get("/profile", protect, (req, res) => {
    res.json({ message: `Welcome ${req.user.id}, you are authorized!`, user: req.user });
});


// =============================================================== 
// ✅ Only therapists can access this route
router.get("/therapist/dashboard", protect, authorizeRoles("therapist"), therapistOnly, getTherapistDashboard, (req, res) => {
    res.json({ message: "Welcome Therapist! You can manage patients here." });
});

// =====================================================================

// ✅ Only admins can access this route
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
    res.json({ message: "Welcome Admin, you have full access!" });
});


// ======================================== therapist to paitient ===========

router.get("/therapist/patients", protect, therapistOnly, getTherapistPatients);


// ======================= USER =============================

router.patch("/toggle-connections", protect, toggleConnectionPreference);


// =============================================================
module.exports = router;
