const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔐 Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // Short-lived token
    );
};

// 🔐 Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" } // Longer-lived
    );
};

// ✅ User Signup
exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const validRoles = ["admin", "user", "therapist"];
        const assignedRole = validRoles.includes(role) ? role : "user";

        const user = new User({ name, email, password: hashedPassword, role: assignedRole });
        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({ accessToken, refreshToken, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ✅ User Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({ accessToken, refreshToken, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 🔄 Refresh Token Endpoint
exports.refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "Refresh Token Required" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(403).json({ message: "Invalid Refresh Token" });

        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ message: "Invalid or Expired Refresh Token" });
    }
};
