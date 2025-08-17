// src/controller/authcontroller.js
import { OAuth2Client } from 'google-auth-library';
import User from '../models/userModel.js';
import { generatetoken } from '../utils/generatetoken.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name: fullName } = ticket.getPayload();

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
      } else {
        user = new User({
          fullName,
          email,
          googleId,
          isVerified: true,
        });
      }
      await user.save();
    }

   
    generatetoken(user._id, res);

    res.status(200).json({
      message: "Google login successful.",
      user: { fullname,
        email,
        googleId,
        role
       },
    });

  } catch (error) {
    res.status(401).json({ message: "Invalid Google token." });
  }
};