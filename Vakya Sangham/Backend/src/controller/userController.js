import User from "../models/usermodel.js";

export const updateOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { education, goal, timeAvailability } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        education,
        goal,
        timeAvailability
      },
      { new: true, runValidators: true }
    ).select("-password -otp -resetPasswordToken -resetPasswordExpire");

    res.status(200).json({
      success: true,
      message: "Onboarding details updated successfully.",
      user: updatedUser
    });

  } catch (error) {
    console.error("Onboarding Update Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
