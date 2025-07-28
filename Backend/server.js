
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import connectdb from './src/config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 3003;

connectdb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SERVER Running Successfully ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
