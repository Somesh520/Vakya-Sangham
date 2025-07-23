import User from "../models/usermodel.js";
import Course from "../models/courseModel.js"; 
import Activity from "../models/activityModel.js"; 
// ========== GET: Enhanced Dashboard Stats ==========

export const getDashboardStats = async (req, res) => {
    try {
        
        const [totalUsers, totalCourses, totalTeachers] = await Promise.all([
            User.countDocuments(),
            Course.countDocuments(),
            User.countDocuments({ role: "teacher" })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeCourses: totalCourses, // Assumes all courses in DB are active
                totalTeachers,
                systemHealth: "Online",
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: True Recent Activities ==========
export const getRecentActivities = async (req, res) => {
    try {
        // Fetches the last 5 activities of any type
        const activities = await Activity.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "fullName profileImageURL"); // Get user's name and image

        res.status(200).json({ success: true, activities });
    } catch (error) {
        console.error("Recent Activities Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: All Users with Pagination ==========
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select("-password -otp")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments();

        res.status(200).json({
            success: true,
            pagination: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
            },
            users,
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: Search for Users ==========
export const searchUsers = async (req, res) => {
    try {
        const query = req.query.q || "";

        if (!query) {
            return res.status(400).json({ success: false, message: "Search query is required." });
        }

        const users = await User.find({
            $or: [
                { fullName: { $regex: query, $options: "i" } }, // Case-insensitive search
                { email: { $regex: query, $options: "i" } }
            ]
        }).select("-password -otp").limit(20);

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Search Users Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== PATCH: Promote User to Teacher ==========
export const promoteToTeacher = async (req, res) => {
    try {
        const { userId } = req.params;
        const { qualifications, subjects, experience } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Update the user's role and their teacher-specific profile
        user.role = 'teacher';
        user.teacherProfile = {
            qualifications,
            subjects,
            experience
        };
        await user.save();

        res.status(200).json({ success: true, message: "User successfully promoted to teacher.", user });
    } catch (error) {
        console.error("Promote User Error:", error);
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


export const updateUser = async (req, res) => {
    try {
        // For security, we explicitly list all fields an admin is allowed to change.
        // This prevents accidental updates to sensitive fields like passwords.
        const allowedUpdates = {
            // fullName: req.body.fullName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            role: req.body.role,
            isVerified: req.body.isVerified,
            // dateOfBirth: req.body.dateOfBirth,
            // education: req.body.education,
            // state: req.body.state,
            // city: req.body.city,
            // District: req.body.District,
            // goal: req.body.goal,
            // contentPreference: req.body.contentPreference,
            // interest: req.body.interest,
            // timeAvailability: req.body.timeAvailability,
            // level: req.body.level,
            // bio: req.body.bio,
            // socialLinks: req.body.socialLinks,
            // preferredLanguage: req.body.preferredLanguage,
            // avatar: req.body.avatar,
            // hasTakenOnlineCourses: req.body.hasTakenOnlineCourses,
            isOnboarded: req.body.isOnboarded
        };

        // This part of your code is smart - it removes any fields that weren't included in the request
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

        res.status(200).json({ success: true, message: "User updated successfully.", user: updatedUser });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};


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
