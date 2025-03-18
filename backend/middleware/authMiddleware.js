const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied: Admins Only" });
    }
    next();
};

module.exports = { protect, adminOnly };
