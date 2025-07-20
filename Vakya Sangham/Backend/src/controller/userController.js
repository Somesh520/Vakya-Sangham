import User from "../models/usermodel.js";

export const updateOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;

    const allowedFields = [
      "dateOfBirth",
      "education",
      "goal",
      "streak",
      "timeAvailability",
      "contentPreference",
      "level",
      "preferredLanguage",
      "avatar",
      "bio",
      "profilePicture",
      "socialLinks",
      "resume",
      "state",
    ];

    const updateObject = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateObject[field] = req.body[field];
      }
    });

    // 👉 Set isOnboarded = true if user filled anything
    if (Object.keys(updateObject).length > 0) {
      updateObject.isOnboarded = true;
    }

    // 🧠 Get existing user to calculate profile progress
    const existingUser = await User.findById(userId).lean();
    const mergedUser = { ...existingUser, ...updateObject };

    // 🔢 Calculate completed fields count
    let completed = 0;
    allowedFields.forEach((field) => {
      const val = mergedUser[field];
      if (
        val !== undefined &&
        val !== null &&
        val !== "" &&
        !(Array.isArray(val) && val.length === 0)
      ) {
        completed++;
      }
    });

    updateObject.profileProgress = {
      completed,
      total: allowedFields.length,
      percentage: Math.floor((completed / allowedFields.length) * 100),
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateObject, {
      new: true,
      runValidators: true,
    }).select("-password -otp -resetPasswordToken -resetPasswordExpire");

    res.status(200).json({
      success: true,
      message: "Onboarding details updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Onboarding Update Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


export const getOnboardingInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "dateOfBirth education goal streak timeAvailability contentPreference level preferredLanguage avatar bio profilePicture socialLinks resume state profileProgress isOnboarded"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Onboarding Info Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
