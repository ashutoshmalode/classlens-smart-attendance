import mongoose from 'mongoose';

const attendanceLogSchema = new mongoose.Schema(
  {
    attendanceDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    action: {
      type: String,
      enum: ['Create', 'Update', 'Resolve Unknown'],
      required: true,
    },
    previousState: {
      type: String,
      default: 'None',
    },
    newState: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AttendanceLog = mongoose.model('AttendanceLog', attendanceLogSchema);
export default AttendanceLog;
