import User from "../models/usermodel.js";
import Enrollment from "../models/enrollmentModel.js";
//import cloudinary from '../config/cloudinary.js';
 import { cloudinary, uploadToCloudinary } from '../config/cloudinary.js'; 
import streamifier from 'streamifier';
import path from 'path';

// --- Helper Function to Upload (No changes) ---
// const uploadToCloudinary = (fileBuffer, options) => {
//     return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
//             if (error) return reject(error);
//             resolve(result);
//         });
//         streamifier.createReadStream(fileBuffer).pipe(stream);
//     });
// };

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

        // --- Define all profile fields ---
        const allProfileFields = [
            "dateOfBirth", "education", "state", "goal", "contentPreference",
            "timeAvailability", "level", "bio", "socialLinks", "profileImageURL",
            "resumeURL", "preferredLanguage",
            "district", "interest", "hasTakenOnlineCourses"
        ];

        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const updateObject = {};
        const uploadPromises = [];

        // --- Helper for Cloudinary deletion ---
        const safeDelete = async (publicId, resource_type = 'image') => {
            if (!publicId) return;
            try {
                await cloudinary.uploader.destroy(publicId, { resource_type });
            } catch (err) {
                console.warn(`Failed to delete old ${resource_type}:`, err);
            }
        };

        // --- Profile Image Upload ---
        if (files?.profileImage) {
            if (existingUser.profileImageURL) {
                const oldPublicId = getPublicIdFromUrl(existingUser.profileImageURL);
                await safeDelete(oldPublicId, 'image');
            }
            const file = files.profileImage[0];
            const publicId = `users/${userId}/profileImages/${Date.now()}_${path.parse(file.originalname).name}`;
            uploadPromises.push(
                uploadToCloudinary(file.buffer, { public_id: publicId })
                    .then(result => { updateObject.profileImageURL = result.secure_url; })
            );
        }

        // --- Resume Upload ---
        if (files?.resume) {
            if (existingUser.resumeURL) {
                const oldPublicId = getPublicIdFromUrl(existingUser.resumeURL);
                await safeDelete(oldPublicId, 'raw');
            }
            const file = files.resume[0];
            const publicId = `users/${userId}/resumes/${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;
            uploadPromises.push(
                uploadToCloudinary(file.buffer, { resource_type: 'raw', public_id: publicId })
                    .then(result => { updateObject.resumeURL = result.secure_url; })
            );
        }

        // --- Wait for uploads ---
        await Promise.all(uploadPromises);

        // --- Update text-based fields with a special case for socialLinks ---
        allProfileFields.forEach(field => {
            if (req.body[field] !== undefined) {
                // SPECIAL CASE: Parse the socialLinks string back into an array
                if (field === "socialLinks" && typeof req.body[field] === 'string') {
                    try {
                        const parsedLinks = JSON.parse(req.body[field]);
                        if (Array.isArray(parsedLinks)) {
                            updateObject[field] = parsedLinks;
                        } else {
                            console.warn("socialLinks field is not a valid JSON array.");
                            updateObject[field] = []; // Default to empty array on parse failure
                        }
                    } catch (e) {
                        console.error("Failed to parse socialLinks JSON:", e);
                        updateObject[field] = []; // Default to empty array on error
                    }
                } else {
                    updateObject[field] = req.body[field];
                }
            }
        });

        // --- Calculate profile progress ---
        const mergedUser = { ...existingUser.toObject(), ...updateObject };
        let completed = 0;

        allProfileFields.forEach(field => {
            const value = mergedUser[field];
            const isFieldCompleted = value !== undefined &&
                                     value !== null &&
                                     String(value).trim() !== "" &&
                                     !(Array.isArray(value) && value.length === 0);
            if (isFieldCompleted) completed++;
        });

        updateObject.profileProgress = {
            completed,
            total: allProfileFields.length,
            percentage: Math.round((completed / allProfileFields.length) * 100),
        };

        // --- Ensure isOnboarded flag is set ---
        updateObject.isOnboarded = true;

        // --- Update User in DB ---
        const updatedUser = await User.findByIdAndUpdate(userId, updateObject, { new: true, runValidators: true })
            .select("-password -otp");

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

export const getme= async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user and select all onboarding fields needed by frontend
        const user = await User.findById(userId).select(
            `fullname dateOfBirth education goal timeAvailability contentPreference
            level preferredLanguage bio profileImageURL socialLinks resumeURL
            state district interest profileProgress isOnboarded enrolledCourses`
        );

        console.log("USER OBJECT FROM DATABASE:", user);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Send response matching frontend expectations
        res.status(200).json({
            success: true,
            data: {
                name: user.fullname || "",
                bio: user.bio || "",
                socialLinks: user.socialLinks || [],
                preferredLanguage: user.preferredLanguage || "",
                profileImageURL: user.profileImageURL || "",
                resumeURL: user.resumeURL || "",
                dateOfBirth: user.dateOfBirth || null,
                education: user.education || "",
                goal: user.goal || "",
                timeAvailability: user.timeAvailability || "",
                contentPreference: user.contentPreference || "",
                level: user.level || "",
                state: user.state || "",
                district: user.district || "",
                interest: user.interest || "",
                 enrolledCourses: user.enrolledCourses || [],
                profileProgress: {
                    completed: user.profileProgress?.completed || 0,
                    total: user.profileProgress?.total || 0,
                    percentage: user.profileProgress?.percentage || 0,
                },
                isOnboarded: user.isOnboarded || false,
               
            }
        });
    } catch (error) {
        console.error("Onboarding Info Error:", error);
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
console.log(user);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Ensure profileProgress exists
        const profile = {
            fullname: user.fullname,
            email: user.email,
            profileImageURL: user.profileImageURL || '',
            profileProgress: {
                percentage: user.profileProgress?.percentage || 0
            }
        };

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('getUserProfile error:', error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
