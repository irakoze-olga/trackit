import express from "express";
import {
  requestOTP,
  verifyOTP,
  getOTPStatus,
  resendOTP
} from "../controller/otp.controller.js";

const router = express.Router();

// Request OTP
router.post("/request", requestOTP);

// Verify OTP
router.post("/verify", verifyOTP);

// Get OTP status
router.get("/status", getOTPStatus);

// Resend OTP
router.post("/resend", resendOTP);

export default router;
