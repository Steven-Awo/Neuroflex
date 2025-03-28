const mongoose = require("mongoose");

const ConnectionRequestSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    createdAt: { type: Date, default: Date.now, expires: 604800 } // 7 days in seconds
}, { timestamps: true });

module.exports = mongoose.model("ConnectionRequest", ConnectionRequestSchema);
