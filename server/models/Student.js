import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Please add a Student ID'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please add student name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add student email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    profilePictures: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length === 3,
        'Student must have exactly 3 profile pictures (Front, Left, Right)',
      ],
    },
    faceDescriptor: {
      type: [Number],
      required: true,
      validate: [
        (val) => val.length === 128,
        'Face descriptor must be a 128-float array',
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
