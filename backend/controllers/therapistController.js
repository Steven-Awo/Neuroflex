const TherapistRecommendation = require("../models/TherapistRecommendation");
const User = require("../models/User");
const crypto = require("crypto");

// 🔐 Utility to hash user IDs
const hashId = (id) => {
    return crypto.createHash("sha256").update(id.toString()).digest("hex");
};

const getTherapistPatients = async (req, res) => {
    try {
        const therapistId = req.user.id;

        // ✅ Pagination from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // ✅ Count total patients
        const total = await TherapistRecommendation.countDocuments({ therapistId });

        // ✅ Get paginated patients
        const recommendations = await TherapistRecommendation
            .find({ therapistId })
            .skip(skip)
            .limit(limit)
            .populate("patientId", "name email");

        // ✅ Format with hashed IDs
        const patients = recommendations.map(rec => ({
            id: hashId(rec.patientId._id), // 🔒 Hashed ID
            name: rec.patientId.name,
            email: rec.patientId.email
        }));

        res.status(200).json({
            status: "success",
            message: "Therapist's patients fetched successfully",
            data: {
                patients,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error("Error fetching therapist patients:", error);
        res.status(500).json({
            status: "error",
            message: "Server Error",
            error: error.message
        });
    }
};

module.exports = {
    getTherapistPatients
};
