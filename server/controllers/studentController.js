import Student from '../models/Student.js';
import { getAverageFaceDescriptor } from '../utils/faceEngine.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Register a new student with multi-angle face pictures
// @route   POST /api/students
// @access  Private (Admin/Faculty)
export const registerStudent = async (req, res) => {
  const { studentId, name, email } = req.body;

  if (!studentId || !name || !email) {
    return res.status(400).json({ success: false, message: 'Please provide Student ID, name, and email' });
  }

  // Validate that 3 photos are uploaded
  if (!req.files || !req.files.frontImage || !req.files.leftImage || !req.files.rightImage) {
    return res.status(400).json({
      success: false,
      message: 'Please upload exactly 3 images (frontImage, leftImage, rightImage)',
    });
  }

  try {
    // Check if studentId or email already exists
    const idExists = await Student.findOne({ studentId });
    if (idExists) {
      return res.status(400).json({ success: false, message: 'Student ID is already registered' });
    }

    const emailExists = await Student.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const frontBuffer = req.files.frontImage[0].buffer;
    const leftBuffer = req.files.leftImage[0].buffer;
    const rightBuffer = req.files.rightImage[0].buffer;

    console.log(`Processing face recognition for student registration: ${name}`);
    
    // Compute average 128-float face descriptor
    let avgDescriptor;
    try {
      avgDescriptor = await getAverageFaceDescriptor([frontBuffer, leftBuffer, rightBuffer]);
    } catch (faceErr) {
      return res.status(400).json({
        success: false,
        message: `Face processing failed: ${faceErr.message}. Ensure there is exactly one visible face in all three photos.`,
      });
    }

    // Upload files to Cloudinary in parallel
    console.log('Uploading registration images to cloud storage...');
    const uploadPromises = [
      uploadToCloudinary(frontBuffer, 'smart-attendance/students'),
      uploadToCloudinary(leftBuffer, 'smart-attendance/students'),
      uploadToCloudinary(rightBuffer, 'smart-attendance/students'),
    ];

    const imageUrls = await Promise.all(uploadPromises);

    // Save student profile
    const student = await Student.create({
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      profilePictures: imageUrls,
      faceDescriptor: avgDescriptor,
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: {
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        profilePictures: student.profilePictures,
      },
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered students
// @route   GET /api/students
// @access  Private (Admin/Faculty)
export const getAllStudents = async (req, res) => {
  try {
    // Exclude descriptor for performance
    const students = await Student.find({}).select('-faceDescriptor').sort({ name: 1 });
    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin/Faculty)
export const updateStudent = async (req, res) => {
  const { studentId, name, email } = req.body;

  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check unique constraints if updating fields
    if (studentId && studentId !== student.studentId) {
      const idExists = await Student.findOne({ studentId });
      if (idExists) {
        return res.status(400).json({ success: false, message: 'Student ID is already registered' });
      }
      student.studentId = studentId.trim();
    }

    if (email && email.toLowerCase() !== student.email) {
      const emailExists = await Student.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }
      student.email = email.trim().toLowerCase();
    }

    if (name) {
      student.name = name.trim();
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: {
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        profilePictures: student.profilePictures,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin/Faculty)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Student profile deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
