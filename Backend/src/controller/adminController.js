

import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import Activity from "../models/activityModel.js";

// ========== GET: Enhanced Dashboard Stats ==========
// यह फंक्शन सही है, इसमें कोई बदलाव नहीं।
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
                activeCourses: totalCourses,
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
        // .lean() का उपयोग करने से क्वेरी तेज होती है और हमें सादे जावास्क्रिप्ट ऑब्जेक्ट मिलते हैं
        let activities = await Activity.find({})
            .sort({ createdAt: -1 })
            .limit(7) // थोड़ा ज़्यादा डेटा भेजें ताकि विविधता दिखे
            .populate("user", "fullname profileImageURL") // आपके मॉडल के अनुसार 'fullname'
            .lean(); 

        // ✅ IMPROVEMENT: डिलीट हो चुके यूज़र्स को शालीनता से हैंडल करें
        activities = activities.map(activity => {
            // अगर यूज़र डिलीट हो गया है, तो populate करने पर user null होगा
            if (activity.user === null) {
                return { 
                    ...activity, 
                    user: { 
                        fullname: 'A Deleted User', 
                        profileImageURL: '' // खाली इमेज URL
                    } 
                };
            }
            return activity;
        });

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

        // ✅ FIX: 'fullName' को 'fullname' किया गया
        const users = await User.find()
            .select("fullname email role phoneNumber profileImageURL isOnboarded progress createdAt")
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
                 // ✅ FIX: 'fullName' को 'fullname' किया गया
                { fullname: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        })
        // ✅ FIX: यहाँ भी 'fullName' को 'fullname' किया गया
        .select("fullname email role phoneNumber profileImageURL isOnboarded progress createdAt")
        .limit(20);
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Search Users Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: Single User by ID ==========
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
           
            .select("fullname email role phoneNumber profileImageURL isOnboarded progress createdAt");

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
            // ✅ FIX: 'fullName' को 'fullname' किया गया
            fullname: req.body.fullname,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            role: req.body.role,
            isVerified: req.body.isVerified,
            isOnboarded: req.body.isOnboarded
        };

        Object.keys(allowedUpdates).forEach(key => {
            if (allowedUpdates[key] === undefined) {
                delete allowedUpdates[key];
            }
        });

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, message: "User updated successfully.", user: updatedUser });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};


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





export const deleteUser = async (req, res) => {
    try {
        // डिलीट किया गया यूज़र 'user' वेरिएबल में सेव होता है
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // एक्टिविटी बनाने के लिए 'user' वेरिएबल का इस्तेमाल करें
        await Activity.create({
            // ✅ FIX: यहाँ 'userToDelete' को 'user' से बदल दिया गया है
            description: `User '${user.fullname}' was deleted by an admin.`,
            type: 'user_deletion',
            user: req.user.id 
        });

        res.status(200).json({ success: true, message: "User deleted successfully." });
        
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
