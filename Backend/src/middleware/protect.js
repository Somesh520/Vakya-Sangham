import jwt from "jsonwebtoken";
import User from "../models/usermodel.js";

export const verifyUser = async (req, res, next) => {
    let token;

    // 1. Check for token in Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    // 2. If not in header, check for token in cookie
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(404).json({ message: "User not found" });
        }

        next();
    } catch (err) {
        // Provide more specific error for expired tokens
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
        }
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};