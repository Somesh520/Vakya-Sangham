import express from 'express'
import dotenv from 'dotenv'

import connectdb from './src/config/db.js'
dotenv.config();
const app=express();
const PORT=process.env.PORT || 3000;
connectdb()
.then(()=>{
    app.listen(PORT,()=>{console.log("SERVER Running Successfully")})
})
.catch((error)=>{
    console.log(error.message);
})

