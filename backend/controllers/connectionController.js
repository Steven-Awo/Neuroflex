const User = require("../models/User");
const ConnectionRequest = require("../models/ConnectionRequest");
const Notification = require("../models/Notification");

const crypto = require("crypto");

// ✅ Utility to hide MongoDB IDs
const hashId = (id) => crypto.createHash("sha256").update(id.toString()).digest("hex");

// 🔍 Therapist/User Search
const searchUsers = async (req, res) => {
    try {
        const query = req.query.q || "";
        const userRole = req.user.role;
        const targetRole = userRole === "therapist" ? "user" : "therapist";

        const results = await User.find({
            role: targetRole,
            name: { $regex: query, $options: "i" }
        }).select("name email role");

        const safeResults = results.map(u => ({
            id: hashId(u._id),
            name: u.name,
            email: u.email,
            role: u.role
        }));

        res.status(200).json({ results: safeResults });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ➕ Send Connection Request
const sendConnectionRequest = async (req, res) => {
    const { targetUserId } = req.body;

    if (!targetUserId) return res.status(400).json({ message: "Target user ID required" });

    try {
        // Check if already connected or requested
        const existing = await ConnectionRequest.findOne({
            from: req.user.id,
            to: targetUserId,
            status: { $in: ["pending", "accepted"] }
        });

        if (existing) {
            return res.status(400).json({ message: "Connection already exists or is pending" });
        }

        const request = new ConnectionRequest({
            from: req.user.id,
            to: targetUserId
        });

        await request.save();

        // ✅ Create a notification for the receiver
        await Notification.create({
            recipient: targetUserId,
            sender: req.user.id,
            type: "connection-request",
            message: `${req.user.name} sent you a connection request`
        });

        res.status(201).json({ message: "Connection request sent" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ Accept or ❌ Decline Request
const respondToRequest = async (req, res) => {
    const { requestId, action } = req.body;

    if (!["accepted", "declined"].includes(action)) {
        return res.status(400).json({ message: "Action must be 'accepted' or 'declined'" });
    }

    try {
        const request = await ConnectionRequest.findById(requestId);

        if (!request || request.to.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized or invalid request" });
        }

        request.status = action;
        await request.save();

        res.status(200).json({ message: `Request ${action}` });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 🔗 Get Connected Users
const getConnectedUsers = async (req, res) => {
    try {
        const connections = await ConnectionRequest.find({
            status: "accepted",
            $or: [{ from: req.user.id }, { to: req.user.id }]
        }).populate("from to", "name email role");

        const connected = connections.map(conn => {
            const other = conn.from._id.toString() === req.user.id ? conn.to : conn.from;
            return {
                id: hashId(other._id),
                name: other.name,
                email: other.email,
                role: other.role
            };
        });

        res.status(200).json({ connected });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getPendingRequests = async (req, res) => {
    try {
        const pendingRequests = await ConnectionRequest.find({
            recipient: req.user.id,
            status: "pending"
        }).populate("sender", "name email role");

        const requests = pendingRequests.map(req => ({
            requestId: req._id,
            from: {
                id: hashUserId(req.sender._id),
                name: req.sender.name,
                email: req.sender.email,
                role: req.sender.role
            }
        }));

        res.status(200).json({ requests });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};



module.exports = {
    searchUsers,
    sendConnectionRequest,
    respondToRequest,
    getConnectedUsers,
    getPendingRequests
};
