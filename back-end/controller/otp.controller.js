import otpService from '../services/otp.service.js';
import User from '../models/user.model.js';

export const requestOTP = async (req, res, next) => {
  try {
    const { email, purpose = 'verification' } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Check if user exists (for login OTP)
    if (purpose === 'login') {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'No account found with this email' 
        });
      }
    }

    // Check if user can request new OTP
    if (!otpService.canRequestOTP(email)) {
      return res.status(429).json({ 
        success: false,
        message: 'Maximum attempts exceeded. Please try again later' 
      });
    }

    const result = await otpService.generateAndSendOTP(email, purpose);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in requestOTP:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send OTP. Please try again' 
    });
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { otpId, otp, email } = req.body;

    if (!otpId || !otp || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP ID, OTP code, and email are required' 
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP must be a 6-digit number' 
      });
    }

    const result = await otpService.verifyOTP(otpId, otp, email);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // If OTP is for login and verification is successful, we can proceed with login
    if (result.purpose === 'login') {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Generate JWT token for successful login
      const jwt = require('jsonwebtoken');
      const { env } = require('../config/env.js');

      const token = jwt.sign(
        { id: user._id.toString(), role: user.role, email: user.email },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      const isProduction = env.NODE_ENV === "production";

      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          age: user.age,
          institution: user.institution,
          fieldOfStudy: user.fieldOfStudy,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
        },
      });
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify OTP. Please try again' 
    });
  }
};

export const getOTPStatus = async (req, res, next) => {
  try {
    const { otpId, email } = req.query;

    if (!otpId || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP ID and email are required' 
      });
    }

    const status = otpService.getOTPStatus(otpId, email);

    res.status(200).json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Error in getOTPStatus:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get OTP status' 
    });
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email, purpose = 'verification' } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    // Check if user can request new OTP
    if (!otpService.canRequestOTP(email)) {
      return res.status(429).json({ 
        success: false,
        message: 'Maximum attempts exceeded. Please try again later' 
      });
    }

    const result = await otpService.generateAndSendOTP(email, purpose);

    res.status(200).json({
      ...result,
      message: 'OTP resent successfully'
    });

  } catch (error) {
    console.error('Error in resendOTP:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to resend OTP. Please try again' 
    });
  }
};
