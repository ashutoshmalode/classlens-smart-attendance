import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';

// Helper to generate JWT token and set in cookie
const sendTokenResponse = (user, role, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  const cookieName = role === 'student' ? 'studentToken' : 'token';

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie(cookieName, token, options)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        studentId: user.studentId || undefined,
      },
    });
};

// @desc    Register Admin (convenience/seed endpoint)
// @route   POST /api/auth/register-admin
// @access  Public
export const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin user already exists' });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'faculty',
    });

    sendTokenResponse(admin, admin.role, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin / Faculty Login
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(admin, admin.role, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Student Login (Self-Service)
// @route   POST /api/auth/student-login
// @access  Public
export const loginStudent = async (req, res) => {
  const { studentId, email } = req.body;

  if (!studentId || !email) {
    return res.status(400).json({ success: false, message: 'Please provide Student ID and email' });
  }

  try {
    const student = await Student.findOne({
      studentId: studentId.trim(),
      email: email.trim().toLowerCase(),
    });

    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid credentials: Student not found' });
    }

    sendTokenResponse(student, 'student', 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.cookie('studentToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    if (req.admin) {
      res.status(200).json({ success: true, user: req.admin });
    } else if (req.student) {
      res.status(200).json({ success: true, user: req.student });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
