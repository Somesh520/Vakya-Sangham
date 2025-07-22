// controllers/adminController.js
import User from "../models/usermodel.js";

// ========== GET: Dashboard Stats ==========
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const admins = await User.countDocuments({ role: "admin" });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                verifiedUsers,
                admins
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: Recent Activities ==========
export const getRecentActivities = async (req, res) => {
    try {
        const users = await User.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select("fullName email createdAt role");

        res.status(200).json({ success: true, recentUsers: users });
    } catch (error) {
        console.error("Recent Activities Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: All Users ==========
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -otp");
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: Single User by ID ==========
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -otp");

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Get User By ID Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== PATCH: Update User ==========
export const updateUser = async (req, res) => {
    try {
        const allowedUpdates = {
            fullName: req.body.fullName,
            role: req.body.role,
            isVerified: req.body.isVerified,
        };

        Object.keys(allowedUpdates).forEach(key => {
            if (allowedUpdates[key] === undefined) {
                delete allowedUpdates[key];
            }
        });

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            allowedUpdates,
            { new: true, runValidators: true }
        ).select("-password -otp");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== DELETE: User ==========
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
