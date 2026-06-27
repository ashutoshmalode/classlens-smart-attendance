import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';

// Protect Admin / Faculty routes
export const protect = async (req, res, next) => {
  let token;

  // Read token from cookie or headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the decoded token belongs to an admin
    if (decoded.role === 'admin' || decoded.role === 'faculty') {
      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        return res.status(401).json({ success: false, message: 'Admin user not found' });
      }
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Access denied: not an administrator' });
    }
  } catch (error) {
    console.error('Admin Auth Middleware Error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Protect Student routes
export const protectStudent = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.studentToken) {
    token = req.cookies.studentToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no student token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'student') {
      req.student = await Student.findById(decoded.id);
      if (!req.student) {
        return res.status(401).json({ success: false, message: 'Student not found' });
      }
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Access denied: not a student' });
    }
  } catch (error) {
    console.error('Student Auth Middleware Error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, student token failed' });
  }
};
