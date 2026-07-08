// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');          // make sure path matches exactly (User.js)
const Student = require('../models/Student');   // if your user model is separate

// Helper: generate JWT with proper expiresIn from env
const generateToken = (id, role) => {
  // FIX: Use process.env.JWT_EXPIRES_IN (make sure it's set to "7d" or similar in .env)
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';  // fallback just in case
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn }    // this must be a valid string like "7d" or a number of seconds
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, studentId, class: className, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,          // password will be hashed by a pre-save hook in the User model
      role: 'student',
    });

    // Optionally create a Student profile linked to this user
    await Student.create({
      userId: user._id,
      studentId,
      class: className,
      phone,
    });

    // FIX: Generate token using the helper
    const token = generateToken(user._id, 'student');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Optional: check role if provided in body (front-end sends it)
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: 'Invalid role for this account' });
    }

    // FIX: Generate token using the helper
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };