import jwt from "jsonwebtoken";
import User from "../models/usermodel.js";

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password"); 
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next(); // ✅ pass to next middleware/controller
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};
