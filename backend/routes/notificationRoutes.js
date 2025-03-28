const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  markAllAsRead
} = require("../controllers/notificationController");

// 🔔 Get all notifications for logged-in user
router.get("/", protect, getNotifications);

// ✅ Mark a specific notification as read
router.put("/read/:notificationId", protect, markNotificationRead);

// ✅ Mark ALL notifications as read
router.put("/read-all", protect, markAllAsRead);

// 🗑️ Delete a specific notification
router.delete("/:notificationId", protect, deleteNotification);

module.exports = router;
