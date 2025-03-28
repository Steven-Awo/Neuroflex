const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
    searchUsers,
    sendConnectionRequest,
    respondToRequest,
    getConnectedUsers,
    getPendingRequests
} = require("../controllers/connectionController");

const router = express.Router();

router.get("/search", protect, searchUsers); // 🔍 Search by name
router.post("/request", protect, sendConnectionRequest); // ➕ Send request
router.post("/respond", protect, respondToRequest); // ✅ or ❌ respond
router.get("/connections", protect, getConnectedUsers); // 🔗 View connections
router.get("/pending", protect, getPendingRequests);
module.exports = router;
