const User = require('../models/User');
const { generateOTP } = require('../utils/otpGenerator');
const { generateToken } = require('../utils/tokenGenerator');
const { sendOTPEmail } = require('../config/email');

/**
 * @desc    Register a new tourist
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, age, gender, email, mobile, city, address, password } = req.body;

    if (!name || !email || !password || !mobile || !city || !address || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required registration fields.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // Resend OTP for unverified user
        const otpData = generateOTP();
        existingUser.otp = otpData;
        existingUser.name = name;
        existingUser.mobile = mobile;
        existingUser.city = city;
        existingUser.address = address;
        existingUser.age = age;
        existingUser.gender = gender;
        existingUser.password = password; // pre-save will re-hash
        await existingUser.save();

        await sendOTPEmail(existingUser.email, otpData.code, 'signup');

        return res.status(200).json({
          success: true,
          message: 'Account already initiated but unverified. A fresh OTP has been sent to your email inbox.',
          data: {
            email: existingUser.email,
            requiresVerification: true,
          },
        });
      }

      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const otpData = generateOTP();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      age,
      gender,
      mobile,
      city,
      address,
      isVerified: false,
      otp: otpData,
    });

    await sendOTPEmail(user.email, otpData.code, 'signup');

    res.status(201).json({
      success: true,
      message: 'Registration successful! A 6-digit verification OTP has been sent to your email inbox.',
      data: {
        email: user.email,
        requiresVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP for account activation
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and 6-digit OTP code.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request a new OTP.',
      });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP code.',
      });
    }

    if (user.otp.code.trim() !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check and try again.',
      });
    }

    // Mark as verified, record sign-in, and clear OTP
    user.isVerified = true;
    user.lastLogin = new Date();
    user.isOnline = true;
    user.loginCount = (user.loginCount || 0) + 1;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Account verified successfully! Welcome to Yatra Lok.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        mobile: user.mobile,
        city: user.city,
        address: user.address,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend verification OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    const otpData = generateOTP();
    user.otp = otpData;
    await user.save();

    await sendOTPEmail(user.email, otpData.code, user.isVerified ? 'forgot-password' : 'signup');

    res.status(200).json({
      success: true,
      message: 'A fresh OTP code has been sent to your email inbox.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please reach out to administrator support.',
      });
    }

    if (!user.isVerified) {
      // Send fresh OTP for activation
      const otpData = generateOTP();
      user.otp = otpData;
      await user.save();
      await sendOTPEmail(user.email, otpData.code, 'signup');

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: 'Account not yet verified. A verification OTP has been sent to your email inbox.',
        email: user.email,
      });
    }

    // Record sign-in timestamp & status
    user.lastLogin = new Date();
    user.isOnline = true;
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        mobile: user.mobile,
        city: user.city,
        address: user.address,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request forgot password OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered user found with this email address.',
      });
    }

    const otpData = generateOTP();
    user.otp = otpData;
    await user.save();

    await sendOTPEmail(user.email, otpData.code, 'forgot-password');

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email inbox.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and the new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP request found.',
      });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new code.',
      });
    }

    if (user.otp.code.trim() !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please try again.',
      });
    }

    // Set new password (pre-save hook hashes it)
    user.password = newPassword;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
