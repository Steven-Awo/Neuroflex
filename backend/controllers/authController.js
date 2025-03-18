const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// User Signup
exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body; // Accepts role from the request body

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Allow only valid roles
        const validRoles = ["admin", "user", "therapist"];
        const assignedRole = validRoles.includes(role) ? role : "user"; // Default to "user" if role is invalid

        console.log("Role before saving:", assignedRole); // Debugging line

        const user = new User({ name, email, password: hashedPassword, role: assignedRole });
        await user.save();

        res.json({ token: generateToken(user), user });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};


// User Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        res.json({ token: generateToken(user), user });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role }, // Now includes role
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};


