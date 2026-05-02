import crypto from 'crypto';
import { sendOTPEmail } from '../controller/email.controller.js';

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In-memory store for OTPs (use Redis in production)
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes
    this.maxAttempts = 3;
    this.attemptsStore = new Map();
  }

  generateOTP() {
    // Generate a 6-digit OTP
    return crypto.randomInt(100000, 999999).toString();
  }

  async generateAndSendOTP(email, purpose = 'verification') {
    try {
      // Clean up expired OTPs
      this.cleanupExpiredOTPs();

      const otp = this.generateOTP();
      const otpId = crypto.randomUUID();
      
      const otpData = {
        id: otpId,
        email: email.toLowerCase(),
        otp,
        purpose,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.otpExpiry),
        attempts: 0
      };

      // Store OTP
      this.otpStore.set(otpId, otpData);
      
      // Reset attempts for this email
      this.attemptsStore.set(email, 0);

      // Send OTP via email
      await sendOTPEmail(email, otp, purpose);

      console.log(`✅ OTP generated and sent to ${email} for ${purpose}`);
      
      return {
        success: true,
        otpId,
        message: 'OTP sent successfully',
        expiresIn: this.otpExpiry / 1000 // in seconds
      };

    } catch (error) {
      console.error('❌ Error generating OTP:', error);
      throw new Error('Failed to generate and send OTP');
    }
  }

  async verifyOTP(otpId, otp, email) {
    try {
      const otpData = this.otpStore.get(otpId);
      
      if (!otpData) {
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Check if OTP is expired
      if (new Date() > otpData.expiresAt) {
        this.otpStore.delete(otpId);
        return {
          success: false,
          message: 'OTP has expired'
        };
      }

      // Check email match
      if (otpData.email !== email.toLowerCase()) {
        return {
          success: false,
          message: 'Email mismatch'
        };
      }

      // Check attempts
      const currentAttempts = this.attemptsStore.get(email) || 0;
      if (currentAttempts >= this.maxAttempts) {
        this.otpStore.delete(otpId);
        this.attemptsStore.delete(email);
        return {
          success: false,
          message: 'Maximum attempts exceeded. Please request a new OTP'
        };
      }

      // Verify OTP
      if (otpData.otp !== otp) {
        this.attemptsStore.set(email, currentAttempts + 1);
        const remainingAttempts = this.maxAttempts - (currentAttempts + 1);
        
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining`,
          remainingAttempts
        };
      }

      // OTP is valid - clean up
      this.otpStore.delete(otpId);
      this.attemptsStore.delete(email);

      return {
        success: true,
        message: 'OTP verified successfully',
        purpose: otpData.purpose
      };

    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      throw new Error('Failed to verify OTP');
    }
  }

  cleanupExpiredOTPs() {
    const now = new Date();
    for (const [otpId, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(otpId);
        this.attemptsStore.delete(otpData.email);
      }
    }
  }

  // Get remaining time for OTP
  getRemainingTime(otpId) {
    const otpData = this.otpStore.get(otpId);
    if (!otpData) return 0;
    
    const remaining = otpData.expiresAt - new Date();
    return Math.max(0, Math.floor(remaining / 1000)); // in seconds
  }

  // Check if user can request new OTP
  canRequestOTP(email) {
    const currentAttempts = this.attemptsStore.get(email) || 0;
    return currentAttempts < this.maxAttempts;
  }

  // Get OTP status
  getOTPStatus(otpId, email) {
    const otpData = this.otpStore.get(otpId);
    if (!otpData) {
      return { exists: false };
    }

    if (otpData.email !== email.toLowerCase()) {
      return { exists: false };
    }

    const isExpired = new Date() > otpData.expiresAt;
    const remainingTime = isExpired ? 0 : this.getRemainingTime(otpId);
    const attempts = this.attemptsStore.get(email) || 0;

    return {
      exists: true,
      isExpired,
      remainingTime,
      attempts,
      maxAttempts: this.maxAttempts,
      canRetry: attempts < this.maxAttempts
    };
  }
}

export default new OTPService();
