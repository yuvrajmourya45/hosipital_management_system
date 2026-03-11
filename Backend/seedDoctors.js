import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import doctorModel from './models/DoctorModel.js';

dotenv.config();

const sampleDoctors = [
  {
    name: "Dr. Richard James",
    email: "richard@hospital.com",
    password: "doctor123",
    image: "doc1.png",
    speciality: "General physician",
    degree: "MBBS",
    experience: "4 Years",
    about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    address: { line1: "17th Cross, Richmond", line2: "Circle, Ring Road, London" },
    available: true
  },
  {
    name: "Dr. Emily Larson",
    email: "emily@hospital.com", 
    password: "doctor123",
    image: "doc2.png",
    speciality: "Gynecologist",
    degree: "MBBS",
    experience: "3 Years",
    about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 60,
    address: { line1: "27th Cross, Richmond", line2: "Circle, Ring Road, London" },
    available: true
  },
  {
    name: "Dr. Sarah Patel",
    email: "sarah@hospital.com",
    password: "doctor123", 
    image: "doc3.png",
    speciality: "Dermatologist",
    degree: "MBBS",
    experience: "1 Years",
    about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 30,
    address: { line1: "37th Cross, Richmond", line2: "Circle, Ring Road, London" },
    available: true
  },
  {
    name: "Dr. Christopher Lee",
    email: "christopher@hospital.com",
    password: "doctor123",
    image: "doc4.png", 
    speciality: "Pediatricians",
    degree: "MBBS",
    experience: "2 Years",
    about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 40,
    address: { line1: "47th Cross, Richmond", line2: "Circle, Ring Road, London" },
    available: true
  },
  {
    name: "Dr. Jennifer Garcia",
    email: "jennifer@hospital.com",
    password: "doctor123",
    image: "doc5.png",
    speciality: "Neurologist", 
    degree: "MBBS",
    experience: "4 Years",
    about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    address: { line1: "57th Cross, Richmond", line2: "Circle, Ring Road, London" },
    available: true
  }
];

const seedDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing doctors
    await doctorModel.deleteMany({});
    console.log('🗑️ Cleared existing doctors');

    // Hash passwords and create doctors
    for (const doctor of sampleDoctors) {
      const hashedPassword = await bcryptjs.hash(doctor.password, 10);
      const newDoctor = new doctorModel({
        ...doctor,
        password: hashedPassword
      });
      await newDoctor.save();
      console.log(`✅ Created doctor: ${doctor.name}`);
    }

    console.log('🎉 Sample doctors seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();