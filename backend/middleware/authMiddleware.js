const jwt = require("jsonwebtoken");

// Middleware to protect routes
const protect = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info (id, role) to req object
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

// Middleware to allow only specific roless
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
