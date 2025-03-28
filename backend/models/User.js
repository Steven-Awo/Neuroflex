const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user", "therapist"], default: "user" }, // Added therapist role
    therapist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null // Null if user is not connected yet
      },
      connectionStatus: {
        type: String,
        enum: ["pending", "connected", "rejected", null],
        default: null
      },
      allowConnections: {
        type: Boolean,
        default: true // ✅ By default, users can receive connection requests
      }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
