import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import dotenv from 'dotenv';
import { errorHandler } from './src/middleware/errorMiddleware.js';

// 📦 Load env variables
dotenv.config();

// ⚙️ Import passport config BEFORE using passport
import './src/config/passport.js';

import authroute from './src/Routes/authroute.js';           // 🔐 Manual login/signup/OTP
import googleAuthRoute from './src/Routes/googleAuthRoute.js'; // 🌐 Google OAuth routes

const app = express();

// 🔌 Middlewares
app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));




app.use(passport.initialize());
app.use(passport.session());

// 🧩 Routes
app.use('/user/auth/google', googleAuthRoute); // 🌐 Google login
app.use('/user/auth', authroute);              // 🔐 Manual login/signup

// 🛑 Error handler middleware
app.use(errorHandler);

export default app;
