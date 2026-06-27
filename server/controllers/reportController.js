import Attendance from '../models/Attendance.js';
import { generateAttendanceCSV } from '../utils/reportGenerator.js';

// @desc    Export attendance session to CSV file
// @route   GET /api/reports/export
// @access  Private (Admin/Faculty)
export const exportAttendanceReport = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Please specify a date (YYYY-MM-DD)' });
  }

  try {
    const attendance = await Attendance.findOne({ date })
      .populate('records.student', 'studentId name email');

    if (!attendance || attendance.records.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No attendance data found for ${date} to export.`,
      });
    }

    const csvContent = generateAttendanceCSV(attendance.records);

    // Set HTTP headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance_report_${date}.csv`
    );
    
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('CSV Export Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
