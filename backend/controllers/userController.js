const User = require("../models/User");

// ✅ Toggle user's ability to receive connection requests
exports.toggleConnectionPreference = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.allowConnections = !user.allowConnections;
        await user.save();

        res.status(200).json({
            status: "success",
            message: `Connection requests are now ${user.allowConnections ? "enabled" : "disabled"}`,
            allowConnections: user.allowConnections
        });
    } catch (err) {
        console.error("Toggle error:", err.message);
        res.status(500).json({
            status: "error",
            message: "Server Error",
            error: err.message
        });
    }
};
