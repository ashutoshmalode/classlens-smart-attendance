import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import AttendanceLog from '../models/AttendanceLog.js';
import { detectAllFacesInImage, cropFace, calculateEuclideanDistance } from '../utils/faceEngine.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Process uploaded classroom images for attendance
// @route   POST /api/attendance/session
// @access  Private (Admin/Faculty)
export const processAttendanceSession = async (req, res) => {
  const { date } = req.body; // YYYY-MM-DD format
  const threshold = parseFloat(req.body.threshold) || 0.6; // Euclidean distance threshold

  if (!date) {
    return res.status(400).json({ success: false, message: 'Please provide an attendance date (YYYY-MM-DD)' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please upload at least one classroom image' });
  }

  try {
    console.log(`Starting attendance processing session for date: ${date} (Threshold: ${threshold})`);

    // 1. Fetch all registered students with descriptors
    const registeredStudents = await Student.find({});
    if (registeredStudents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No students registered yet. Please register students first.',
      });
    }

    // 2. Upload classroom photos to Cloudinary in parallel
    console.log(`Uploading ${req.files.length} classroom photos to storage...`);
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'smart-attendance/sessions')
    );
    const classroomPhotoUrls = await Promise.all(uploadPromises);

    // 3. Process each classroom image
    const identifiedStudentMatches = new Map(); // studentId => { status, method, confidence, detectedAt }
    const unknownFacesList = [];

    for (let photoIndex = 0; photoIndex < req.files.length; photoIndex++) {
      const file = req.files[photoIndex];
      const photoUrl = classroomPhotoUrls[photoIndex];
      console.log(`- Running face-api detection on photo ${photoIndex + 1}/${req.files.length}...`);

      let detectedFaces = [];
      try {
        detectedFaces = await detectAllFacesInImage(file.buffer);
      } catch (err) {
        console.error(`  Error processing photo ${photoIndex + 1}:`, err.message);
        continue; // Skip failed photos
      }

      console.log(`  Detected ${detectedFaces.length} faces in photo ${photoIndex + 1}`);

      for (const face of detectedFaces) {
        let bestMatch = null;
        let minDistance = 999;

        // Find match amongst registered students
        for (const student of registeredStudents) {
          const distance = calculateEuclideanDistance(face.descriptor, student.faceDescriptor);
          if (distance < minDistance) {
            minDistance = distance;
            bestMatch = student;
          }
        }

        // If distance is below threshold, match is successful
        if (bestMatch && minDistance < threshold) {
          console.log(`  Match found: ${bestMatch.name} (Dist: ${minDistance.toFixed(3)})`);
          
          const existingMatch = identifiedStudentMatches.get(bestMatch._id.toString());
          // Keep match with the higher confidence (smaller Euclidean distance)
          if (!existingMatch || minDistance < existingMatch.confidence) {
            identifiedStudentMatches.set(bestMatch._id.toString(), {
              student: bestMatch._id,
              status: 'Present',
              method: 'AI',
              confidence: minDistance,
              boundingBox: face.boundingBox,
              photoIndex,
              detectedAt: new Date(),
            });
          }
        } else {
          // Unidentified/Unknown Face
          console.log(`  Unknown face detected (Min Dist: ${minDistance.toFixed(3)}). Cropping...`);
          try {
            const croppedBuffer = await cropFace(file.buffer, face.boundingBox);
            const cropUrl = await uploadToCloudinary(croppedBuffer, 'smart-attendance/unknown');
            
            unknownFacesList.push({
              imageUrl: cropUrl,
              boundingBox: face.boundingBox,
              photoIndex,
            });
          } catch (cropErr) {
            console.error('  Failed to crop and upload unknown face:', cropErr.message);
          }
        }
      }
    }

    // 4. Fill in records for absent students (all registered students who were not detected)
    const finalRecords = [];
    for (const student of registeredStudents) {
      const studentIdStr = student._id.toString();
      if (identifiedStudentMatches.has(studentIdStr)) {
        finalRecords.push(identifiedStudentMatches.get(studentIdStr));
      } else {
        finalRecords.push({
          student: student._id,
          status: 'Absent',
          method: 'AI',
          confidence: 0.0,
          detectedAt: new Date(),
        });
      }
    }

    // 5. Update or Create Attendance document
    let attendance = await Attendance.findOne({ date });

    if (attendance) {
      console.log('Attendance record exists for this date. Merging/Overwriting...');
      attendance.records = finalRecords;
      // Merge classroom photos
      attendance.classPhotos = [...new Set([...attendance.classPhotos, ...classroomPhotoUrls])];
      // Overwrite unknown faces with new scan
      attendance.unknownFaces = unknownFacesList;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        date,
        records: finalRecords,
        unknownFaces: unknownFacesList,
        classPhotos: classroomPhotoUrls,
      });
    }

    // Populate student references before responding
    await attendance.populate('records.student', 'studentId name email profilePictures');
    await attendance.populate('unknownFaces.assignedStudent', 'studentId name email');

    // Create Audit Log for AI Scan execution
    const presentCount = finalRecords.filter((r) => r.status === 'Present').length;
    console.log(`AI Scan completed. Present: ${presentCount}, Absent: ${finalRecords.length - presentCount}, Unknown: ${unknownFacesList.length}`);

    res.status(200).json({
      success: true,
      message: 'Classroom scan completed successfully',
      statistics: {
        totalStudents: registeredStudents.length,
        present: presentCount,
        absent: finalRecords.length - presentCount,
        unknown: unknownFacesList.length,
        attendancePercentage: ((presentCount / registeredStudents.length) * 100).toFixed(1),
      },
      attendance,
    });
  } catch (error) {
    console.error('Session processing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance records for a specific date
// @route   GET /api/attendance
// @access  Private (Admin/Faculty/Student self-lookup)
export const getAttendanceByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Please provide a date' });
  }

  try {
    const attendance = await Attendance.findOne({ date })
      .populate('records.student', 'studentId name email profilePictures')
      .populate('unknownFaces.assignedStudent', 'studentId name email');

    if (!attendance) {
      // If no attendance sheet exists for this date, return empty status but success
      return res.status(200).json({
        success: true,
        message: 'No attendance records found for this date',
        attendance: null,
      });
    }

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manually override student attendance status
// @route   PUT /api/attendance/manual
// @access  Private (Admin/Faculty)
export const markAttendanceManually = async (req, res) => {
  const { date, studentId, status } = req.body; // status is 'Present' or 'Absent'

  if (!date || !studentId || !status) {
    return res.status(400).json({ success: false, message: 'Please provide date, student ID, and status' });
  }

  try {
    // Check if attendance record exists for the date
    let attendance = await Attendance.findOne({ date });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No attendance session exists for this date. Please run a scan or initialize it first.',
      });
    }

    // Find student in record
    const recordIndex = attendance.records.findIndex(
      (r) => r.student.toString() === studentId
    );

    let previousStatus = 'None';
    if (recordIndex !== -1) {
      previousStatus = attendance.records[recordIndex].status;
      attendance.records[recordIndex].status = status;
      attendance.records[recordIndex].method = 'Manual';
      attendance.records[recordIndex].detectedAt = new Date();
    } else {
      // If not in records, add it
      attendance.records.push({
        student: studentId,
        status,
        method: 'Manual',
        confidence: 1.0,
        detectedAt: new Date(),
      });
    }

    await attendance.save();

    // Create Audit Log entry
    await AttendanceLog.create({
      attendanceDate: date,
      student: studentId,
      action: 'Update',
      previousState: previousStatus,
      newState: status,
      changedBy: req.admin._id,
    });

    await attendance.populate('records.student', 'studentId name email profilePictures');
    await attendance.populate('unknownFaces.assignedStudent', 'studentId name email');

    res.status(200).json({
      success: true,
      message: 'Attendance status adjusted manually',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign an unknown cropped face to a registered student
// @route   POST /api/attendance/resolve-unknown
// @access  Private (Admin/Faculty)
export const resolveUnknownFace = async (req, res) => {
  const { date, unknownFaceId, studentId } = req.body;

  if (!date || !unknownFaceId || !studentId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide date, unknownFaceId, and registered student ID',
    });
  }

  try {
    const attendance = await Attendance.findOne({ date });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found for this date' });
    }

    // Find unknown face index
    const unknownFace = attendance.unknownFaces.id(unknownFaceId);
    if (!unknownFace) {
      return res.status(404).json({ success: false, message: 'Unknown face record not found' });
    }

    // Check if already assigned
    if (unknownFace.assignedStudent) {
      return res.status(400).json({ success: false, message: 'This face has already been assigned' });
    }

    // Assign the student ID to the unknown face
    unknownFace.assignedStudent = studentId;

    // Now update the student's status in records to Present
    const recordIndex = attendance.records.findIndex(
      (r) => r.student.toString() === studentId
    );

    let previousStatus = 'Absent';
    if (recordIndex !== -1) {
      previousStatus = attendance.records[recordIndex].status;
      attendance.records[recordIndex].status = 'Present';
      attendance.records[recordIndex].method = 'Manual';
      attendance.records[recordIndex].detectedAt = new Date();
    } else {
      attendance.records.push({
        student: studentId,
        status: 'Present',
        method: 'Manual',
        confidence: 1.0,
        detectedAt: new Date(),
      });
    }

    await attendance.save();

    // Create Audit Log entry
    await AttendanceLog.create({
      attendanceDate: date,
      student: studentId,
      action: 'Resolve Unknown',
      previousState: previousStatus,
      newState: 'Present',
      changedBy: req.admin._id,
    });

    await attendance.populate('records.student', 'studentId name email profilePictures');
    await attendance.populate('unknownFaces.assignedStudent', 'studentId name email');

    res.status(200).json({
      success: true,
      message: 'Unknown face successfully resolved and student marked Present',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance records for the logged-in student
// @route   GET /api/attendance/my-attendance
// @access  Private (Student)
export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.student._id;

    // Find all attendance records
    const attendanceSheets = await Attendance.find({
      'records.student': studentId
    }).sort({ date: -1 });

    const history = [];
    let presentCount = 0;
    let absentCount = 0;

    for (const sheet of attendanceSheets) {
      const studentRecord = sheet.records.find(
        (r) => r.student.toString() === studentId.toString()
      );
      if (studentRecord) {
        history.push({
          date: sheet.date,
          status: studentRecord.status,
          method: studentRecord.method,
          confidence: studentRecord.confidence,
          detectedAt: studentRecord.detectedAt,
        });

        if (studentRecord.status === 'Present') {
          presentCount++;
        } else {
          absentCount++;
        }
      }
    }

    const totalSessions = history.length;
    const attendancePercentage = totalSessions > 0
      ? ((presentCount / totalSessions) * 100).toFixed(1)
      : '0.0';

    res.status(200).json({
      success: true,
      statistics: {
        totalSessions,
        present: presentCount,
        absent: absentCount,
        attendancePercentage,
      },
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

