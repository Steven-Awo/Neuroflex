const TherapistRecommendation = require("../models/TherapistRecommendation");
const User = require("../models/User");
const Exercise = require("../models/Exercise");
const ConnectionRequest = require("../models/ConnectionRequest");
const crypto = require("crypto");

// 🔐 Utility to hash user IDs
const hashId = (id) => {
    return crypto.createHash("sha256").update(id.toString()).digest("hex");
};

// ✅ Get paginated patients for therapist
const getTherapistPatients = async (req, res) => {
    try {
        const therapistId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await TherapistRecommendation.countDocuments({ therapistId });

        const recommendations = await TherapistRecommendation
            .find({ therapistId })
            .skip(skip)
            .limit(limit)
            .populate("patientId", "name email");

        const patients = recommendations.map(rec => ({
            id: hashId(rec.patientId._id),
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

// ✅ Therapist dashboard stats
const getTherapistDashboard = async (req, res) => {
    try {
        const therapistId = req.user.id;

        const [totalConnected, allRecommendations, pendingRequests, acceptedRequests, declinedRequests] =
            await Promise.all([
                TherapistRecommendation.countDocuments({ therapistId }),
                TherapistRecommendation.find({ therapistId }),
                ConnectionRequest.countDocuments({ therapistId, status: "pending" }),
                ConnectionRequest.countDocuments({ therapistId, status: "accepted" }),
                ConnectionRequest.countDocuments({ therapistId, status: "declined" })
            ]);

        const assignedExerciseCount = allRecommendations.reduce(
            (total, rec) => total + rec.exercises.length, 0
        );

        res.status(200).json({
            status: "success",
            message: "Therapist dashboard stats fetched",
            data: {
                totalConnected,
                assignedExerciseCount,
                pendingRequests,
                acceptedRequests,
                declinedRequests
            }
        });

    } catch (error) {
        console.error("Dashboard Error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server Error",
            error: error.message
        });
    }
};

module.exports = {
    getTherapistPatients,
    getTherapistDashboard
};
