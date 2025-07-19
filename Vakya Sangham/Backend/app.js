// ------------------- 🌍 Core Imports -------------------
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import dotenv from 'dotenv';
import morgan from 'morgan';

// ------------------- 🔐 Security Middleware -------------------
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';

// ------------------- 🧠 Custom Imports -------------------
import { errorHandler } from './src/middleware/errorMiddleware.js';
import logger from './src/utils/logger.js';
import authroute from './src/Routes/authroute.js';               // 🔐 Manual login/signup
import googleAuthRoute from './src/Routes/googleAuthRoute.js';   // 🌐 Google OAuth
import userroute from './src/Routes/userroute.js';               // 👤 User profile/info

// ------------------- ⚙️ Initial Setup -------------------
dotenv.config();
import './src/config/passport.js'; // ⬅️ Passport config must be loaded before usage

const app = express();

// ------------------- ⚒️ Middleware Setup -------------------


app.use(cookieParser());


app.use(mongoSanitize());


app.use(xss());


app.use(express.json());


app.use(cors());


app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));


app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// ------------------- 🚫 Rate Limiting -------------------


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: 'Too many login attempts. Try again later.',
  }
});


app.use('/user/auth/login', loginLimiter);

// ------------------- 🔐 Passport Setup -------------------
app.use(passport.initialize());
app.use(passport.session());

// ------------------- 🧩 Route Mounting -------------------
app.use('/user/auth/google', googleAuthRoute);  // 🌐 Google OAuth
app.use('/user/auth', authroute);               // 🔐 Manual auth (login/signup)
app.use('/user/info', userroute);               // 👤 Profile, user data, etc.

// ------------------- 🛑 Error Handling Middleware -------------------
app.use(errorHandler);


export default app;
