const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../config/jwt");

// User Signup
exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        res.json({ token: generateToken(user), user });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
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
