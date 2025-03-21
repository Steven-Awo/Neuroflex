const UserExercise = require("../models/UserExercise");

// 🟢 Add an exercise to the user's list
const addUserExercise = async (req, res) => {
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

// 🟢 Get exercises selected by the user
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

// 🟢 User updates progress on an exercise
const updateProgress = async (req, res) => {
    try {
        const { exerciseId, completedReps, completedSets } = req.body;
        const userId = req.user.id;

        let userExercises = await UserExercise.findOne({ userId });

        if (!userExercises) {
            return res.status(404).json({ message: "User exercise record not found" });
        }

        // Find the exercise progress entry
        let exerciseProgress = userExercises.progress.find(p => p.exerciseId.toString() === exerciseId);

        if (!exerciseProgress) {
            // If progress doesn't exist, create it
            userExercises.progress.push({ exerciseId, completedReps, completedSets });
        } else {
            // Update existing progress
            exerciseProgress.completedReps = completedReps;
            exerciseProgress.completedSets = completedSets;
            exerciseProgress.lastUpdated = Date.now();
        }

        await userExercises.save();
        res.status(200).json({ message: "Progress updated successfully", userExercises });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ **Export the functions correctly**
module.exports = {
    addUserExercise,
    getUserExercises,
    updateProgress
};
