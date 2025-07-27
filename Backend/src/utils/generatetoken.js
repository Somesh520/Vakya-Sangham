import jwt from "jsonwebtoken";

/**
 * Generate JWT and set it in cookie + return it
 * @param {String} userID - MongoDB User ID
 * @param {Object} res - Express response object
 * @returns {String} token
 */
export const generatetoken = (userID, res) => {
  const token = jwt.sign({ id: userID }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    httpOnly: true, // security
    sameSite: "Lax", 
    secure: process.env.NODE_ENV === "production", // true in prod
  });

  return token;
};
