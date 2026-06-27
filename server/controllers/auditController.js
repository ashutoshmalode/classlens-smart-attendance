import AttendanceLog from '../models/AttendanceLog.js';

// @desc    Retrieve all audit logs chronological list
// @route   GET /api/audit-logs
// @access  Private (Admin/Faculty)
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AttendanceLog.find({})
      .populate('student', 'studentId name email')
      .populate('changedBy', 'name email role')
      .sort({ timestamp: -1 }); // Newest logs first

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
