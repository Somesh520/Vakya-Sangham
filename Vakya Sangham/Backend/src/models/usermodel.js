import mongoose from 'mongoose'

const user=new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
 password: {
  type: String,
  required: function () {
    return !this.googleId; // not required if google user
  }},



  phoneNumber: { type: String },
  referralCode: { type: String },
googleId: {
  type: String,
  unique: true,
  sparse: true
},

  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },

}, { timestamps: true });



const User=mongoose.model('user',user);
export default User;