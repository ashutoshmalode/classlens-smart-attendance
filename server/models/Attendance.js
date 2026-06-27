import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true,
  },
  method: {
    type: String,
    enum: ['AI', 'Manual'],
    default: 'AI',
  },
  confidence: {
    type: Number,
    default: 0.0,
  },
  boundingBox: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },
  photoIndex: {
    type: Number,
    default: -1,
  },
  detectedAt: {
    type: Date,
    default: Date.now,
  },
});

const unknownFaceSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  boundingBox: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },
  photoIndex: {
    type: Number,
    required: true,
  },
  assignedStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null,
  },
});

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      unique: true,
    },
    records: [attendanceRecordSchema],
    unknownFaces: [unknownFaceSchema],
    classPhotos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add index on date
attendanceSchema.index({ date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
