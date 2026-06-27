import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Student from './models/Student.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://db_admin:%23Ashutosh%40123@smart-attendance.mdijc9g.mongodb.net/smart-attendance?retryWrites=true&w=majority&appName=Smart-Attendance';

// Helper to generate a dummy 128-float vector for face descriptor
const generateMockDescriptor = () => {
  return Array.from({ length: 128 }, () => Math.random() * 0.1);
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data (optional, but good for clean slate)
    await Admin.deleteMany({});
    await Student.deleteMany({});
    console.log('Cleared existing Admins and Students.');

    // 1. Create Faculty/Admin
    const faculty = await Admin.create({
      name: 'Faculty Member',
      email: 'faculty@university.edu',
      password: 'password123',
      role: 'faculty',
    });
    console.log('Admin/Faculty created: faculty@university.edu / password123');

    // 2. Create Students
    const student1 = await Student.create({
      studentId: 'STU2026101',
      name: 'Ashutosh Sharma',
      email: 'ashutosh@university.edu',
      profilePictures: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80'
      ],
      faceDescriptor: generateMockDescriptor(),
    });

    const student2 = await Student.create({
      studentId: 'STU2026102',
      name: 'Anirudh Rao',
      email: 'anirudh@university.edu',
      profilePictures: [
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80'
      ],
      faceDescriptor: generateMockDescriptor(),
    });

    const student3 = await Student.create({
      studentId: 'STU2026103',
      name: 'Priya Patel',
      email: 'priya@university.edu',
      profilePictures: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80'
      ],
      faceDescriptor: generateMockDescriptor(),
    });

    console.log('Seeded 3 test students successfully!');
    console.log('- Ashutosh Sharma (STU2026101 / ashutosh@university.edu)');
    console.log('- Anirudh Rao (STU2026102 / anirudh@university.edu)');
    console.log('- Priya Patel (STU2026103 / priya@university.edu)');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
