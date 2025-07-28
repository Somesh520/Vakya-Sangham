
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import connectdb from './src/config/db.js';
import app from './app.js';

<<<<<<< HEAD
const PORT = process.env.PORT || 3003;
=======
const PORT = process.env.PORT || 3000;
>>>>>>> 6e2f0659088c1d87d9eb7e20754f9405771297f6

connectdb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SERVER Running Successfully ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
