const Exercise = require("../models/Exercise");
const UserExercise = require("../models/UserExercise");
const TherapistRecommendation = require("../models/TherapistRecommendation");
const User = require("../models/User");
const mongoose = require("mongoose"); // Make sure this is at the top

// 🟢 Admin creates a new exercise
const createExercise = async (req, res) => {
    try {
        const { name, description, category, difficulty, videoUrl } = req.body;

        const newExercise = new Exercise({
            name,
            description,
            category,
            difficulty,
            videoUrl,
            createdBy: req.user.id
        });

        await newExercise.save();
        res.status(201).json({ message: "Exercise created successfully", exercise: newExercise });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 🟢 Admin deletes an exercise
const deleteExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) {
            return res.status(404).json({ message: "Exercise not found" });
        }
        await exercise.deleteOne();
        res.status(200).json({ message: "Exercise deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 🟢 Get all exercises
const getAllExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.status(200).json(exercises);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 🟢 User selects an exercise
const selectExercise = async (req, res) => {
    try {
        const { exerciseId } = req.body;
        const userId = req.user.id;

        let userExercises = await UserExercise.findOne({ userId });

        if (!userExercises) {
            userExercises = new UserExercise({ userId, exercises: [exerciseId] });
        } else {
            if (userExercises.exercises.includes(exerciseId)) {
                return res.status(400).json({ message: "Exercise already added to your list." });
            }
            userExercises.exercises.push(exerciseId);
        }

        await userExercises.save();
        res.status(200).json({ message: "Exercise added to your list", userExercises });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 🟢 Get user-selected exercises
const getUserExercises = async (req, res) => {
    try {
        const userExercises = await UserExercise.findOne({ userId: req.user.id }).populate("exercises");

        if (!userExercises) {
            return res.status(200).json({ exercises: [] });
        }

        res.status(200).json(userExercises.exercises);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 🟢 User updates exercise progress
// 🟢 User updates exercise progress
const updateExerciseProgress = async (req, res) => {
    try {
        const { exerciseId, completedReps, completedSets } = req.body;
        const userId = req.user.id;

        // 🔐 Check if exerciseId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
            return res.status(400).json({ message: "Invalid exercise ID format" });
        }

        const userExercises = await UserExercise.findOne({ userId });
        if (!userExercises) {
            return res.status(404).json({ message: "User exercise record not found" });
        }

        // Find the exercise progress entry
        let exerciseProgress = userExercises.progress.find(
            (p) => p.exerciseId.toString() === exerciseId
        );

        if (!exerciseProgress) {
            // If progress doesn't exist, create it
            userExercises.progress.push({
                exerciseId,
                completedReps,
                completedSets,
                lastUpdated: new Date()
            });
        } else {
            // Update existing progress
            exerciseProgress.completedReps = completedReps;
            exerciseProgress.completedSets = completedSets;
            exerciseProgress.lastUpdated = new Date();
        }

        await userExercises.save();
        res.status(200).json({ message: "Progress updated successfully", userExercises });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



// 🧠 Get recommendations for a specific user
const getRecommendationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const recommendations = await TherapistRecommendation
            .findOne({ patientId: userId })
            .populate("exercises");

        if (!recommendations) {
            return res.status(200).json({ exercises: [] });
        }

        res.status(200).json({ exercises: recommendations.exercises });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



// 🟢 Therapist recommends an exercise to a user ✅ FIXED
const recommendExercise = async (req, res) => {
    try {
        const { patientId, exerciseId } = req.body;

        const existingExercise = await Exercise.findById(exerciseId);
        if (!existingExercise) {
            return res.status(404).json({ message: "Exercise not found" });
        }

        let recommendation = await TherapistRecommendation.findOne({ therapistId: req.user.id, patientId });

        if (!recommendation) {
            recommendation = new TherapistRecommendation({ therapistId: req.user.id, patientId, exercises: [exerciseId] });
        } else {
            if (!recommendation.exercises.includes(exerciseId)) {
                recommendation.exercises.push(exerciseId);
            }
        }

        await recommendation.save();
        res.status(200).json({ message: "Exercise recommended successfully", recommendation });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 🟢 Therapist assigns exercises to a user

const assignExerciseToUser = async (req, res) => {
    try {
        const { patientId, exerciseIds } = req.body;

        // console.log("Received patientId:", patientId);
        // console.log("Received exerciseIds:", exerciseIds);

        // Validate patientId format
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: "Invalid patientId format" });
        }

        // Validate exerciseIds array format
        if (!Array.isArray(exerciseIds)) {
            return res.status(400).json({ message: "exerciseIds must be an array" });
        }

        // Convert exerciseIds from strings to ObjectId
        const objectIds = exerciseIds.map(id => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.log("Invalid ObjectId detected:", id);
                return null; // Flag invalid IDs
            }
            return new mongoose.Types.ObjectId(id);
        }).filter(id => id !== null); // Remove null values

        if (objectIds.length !== exerciseIds.length) {
            return res.status(400).json({ message: "One or more exerciseIds are invalid" });
        }

        console.log("Converted ObjectIds:", objectIds);

        // Validate if all exercises exist
        const exercisesExist = await Exercise.find({ _id: { $in: objectIds } });
        if (exercisesExist.length !== objectIds.length) {
            console.log("Some exercises do not exist:", exercisesExist.map(e => e._id));
            return res.status(400).json({ message: "One or more exerciseIds do not exist in the database" });
        }

        // Ensure the patient exists
        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        let recommendation = await TherapistRecommendation.findOne({ therapistId: req.user.id, patientId });

        if (!recommendation) {
            recommendation = new TherapistRecommendation({
                therapistId: req.user.id,
                patientId,
                exercises: objectIds,
            });
        } else {
            recommendation.exercises = [...new Set([...recommendation.exercises, ...objectIds])];
        }

        await recommendation.save();

        res.status(200).json({ message: "Exercises assigned successfully", recommendation });
    } catch (error) {
        console.error("Error in assignExerciseToUser:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};




// 🟢 Get exercises assigned to a user
const getAssignedExercises = async (req, res) => {
    try {
        const assignedExercises = await TherapistRecommendation.findOne({ patientId: req.user.id })
            .populate("exercises");

        if (!assignedExercises) {
            return res.status(200).json({ exercises: [] });
        }

        res.status(200).json(assignedExercises.exercises);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 🟢 Export all functions correctly
module.exports = {
    createExercise,
    deleteExercise,
    getAllExercises,
    selectExercise,
    getUserExercises,
    updateExerciseProgress,
    recommendExercise,
    getRecommendationsForUser,
    assignExerciseToUser,
    getAssignedExercises
};
