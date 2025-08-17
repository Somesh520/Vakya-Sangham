import User from "../models/userModel.js";
import Enrollment from "../models/enrollmentModel.js";
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import path from 'path';

// --- Helper Function to Upload (No changes) ---
const uploadToCloudinary = (fileBuffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// --- Single, CORRECTED Helper Function to Extract Public ID ---
const getPublicIdFromUrl = (url) => {
    const regex = /\/v\d+\/(.+)$/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// --- Corrected Onboarding Function ---
export const updateOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;
        const files = req.files;

    
const allProfileFields = [
    "dateOfBirth", "education", "state", "goal", "contentPreference", 
    "timeAvailability", "level", "bio", "socialLinks", "profileImageURL", 
    "resumeURL", "preferredLanguage", "avatar", "city", "District", "interest",
    "hasTakenOnlineCourses"
];

        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const updateObject = {};
        const uploadPromises = [];

        // --- Profile Image Logic ---
        if (files?.profileImage) {
            if (existingUser.profileImageURL) {
                const oldPublicId = getPublicIdFromUrl(existingUser.profileImageURL);
                if (oldPublicId) {
                    const publicIdWithoutExt = oldPublicId.substring(0, oldPublicId.lastIndexOf('.'));
                    await cloudinary.uploader.destroy(publicIdWithoutExt, { resource_type: 'image' }).catch(err => console.error("Failed to delete old image:", err));
                }
            }
            // BUG FIX: Moved upload logic INSIDE the if-statement
            const file = files.profileImage[0];
            const publicId = `users/${userId}/profileImages/${Date.now()}_${path.parse(file.originalname).name}`;
            uploadPromises.push(
                uploadToCloudinary(file.buffer, { public_id: publicId })
                .then(result => { updateObject.profileImageURL = result.secure_url; })
            );
        }

        // --- Resume Logic ---
        if (files?.resume) {
            if (existingUser.resumeURL) {
                const oldPublicId = getPublicIdFromUrl(existingUser.resumeURL);
                if (oldPublicId) {
                    await cloudinary.uploader.destroy(oldPublicId, { resource_type: "raw" }).catch(err => console.error("Failed to delete old resume:", err));
                }
            }
            // BUG FIX: Moved upload logic INSIDE the if-statement
            const file = files.resume[0];
            const publicId = `users/${userId}/resumes/${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;
            uploadPromises.push(
                uploadToCloudinary(file.buffer, { resource_type: "raw", public_id: publicId })
                .then(result => { updateObject.resumeURL = result.secure_url; })
            );
        }
        
        await Promise.all(uploadPromises);

        // --- Handle Text-Based Fields & Profile Progress ---
        const fieldsToUpdateFromRequest = allProfileFields.filter(f => f !== 'profileImageURL' && f !== 'resumeURL');
        fieldsToUpdateFromRequest.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateObject[field] = req.body[field];
            }
        });

        if (Object.keys(updateObject).length > 0) {
            updateObject.isOnboarded = true;
        }
        const mergedUser = { ...existingUser.toObject(), ...updateObject };
        let completed = 0;
        allProfileFields.forEach((field) => {
            const value = mergedUser[field];
            const isFieldCompleted = value !== undefined && value !== null && String(value).trim() !== "" && !(Array.isArray(value) && value.length === 0);
            if (isFieldCompleted) completed++;
        });
        updateObject.profileProgress = {
            completed,
            total: allProfileFields.length,
            percentage: Math.round((completed / allProfileFields.length) * 100),
        };
        const updatedUser = await User.findByIdAndUpdate(userId, updateObject, { new: true, runValidators: true }).select("-password -otp");

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
// const user = await User.findById(userId);
        // This part is correct, it fetches the user with the 'fullname' field
        const user = await User.findById(userId).select(
            " dateOfBirth education goal streak timeAvailability contentPreference level preferredLanguage avatar bio profileImageURL socialLinks resumeURL state city District interest profileProgress isOnboarded fullname"
        );
  console.log("USER OBJECT FROM DATABASE:", user);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // UPDATED: Send a response object that matches the frontend's expectations
        res.status(200).json({
            success: true,
            data: {
                // We are mapping the database 'fullname' to 'name' for the frontend
                name: user.fullname,
                // Sending other fields as they are
                bio: user.bio,
                socialLinks: user.socialLinks,
                preferredLanguage: user.preferredLanguage,
                avatar: user.avatar,
                // You can add any other fields from the 'user' object here
            }
        });
    } catch (error) {
        console.error("Onboarding Info Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

export const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select("fullname");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const enrollments = await Enrollment.find({ student: userId }).populate({
            path: 'course',
            select: 'title description thumbnailURL category level' 
        });

        const enrolledCourses = enrollments.map(e => e.course);

        res.status(200).json({
            success: true,
            user: {
                fullName: user.fullName
            },
            enrolledCourses
        });

    } catch (error) {
        console.error("Student Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching dashboard data." });
    }
};
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('fullname email profileImageURL profileProgress');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};