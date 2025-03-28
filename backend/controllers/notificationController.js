// controllers/notificationController.js
const Notification = require("../models/Notification");
const crypto = require("crypto");

const hashId = (id) => crypto.createHash("sha256").update(id.toString()).digest("hex");

// ✅ 1. Get all notifications for logged-in user
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate("sender", "name email role");

        const formatted = notifications.map((n) => ({
            id: hashId(n._id),
            from: n.sender ? {
                name: n.sender.name,
                email: n.sender.email,
                role: n.sender.role
            } : null,
            type: n.type,
            message: n.message,
            isRead: n.isRead,
            createdAt: n.createdAt
        }));

        res.status(200).json({ notifications: formatted });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ✅ 2. Mark notification as read
const markNotificationRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findById(notificationId);

        if (!notification || notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized or not found" });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ✅ 3. Delete a notification
const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findById(notificationId);

        if (!notification || notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized or not found" });
        }

        await notification.deleteOne();
        res.status(200).json({ message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ✅ 4. Mark all as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

module.exports = {
    getNotifications,
    markNotificationRead,
    deleteNotification,
    markAllAsRead
};
