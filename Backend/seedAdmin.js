import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// Production MongoDB URI
const MONGO_URI = "mongodb+srv://yuvrajmourya14_db_user:UCNYEALGvJwmTXle@yuvraj.gztnrts.mongodb.net/docter?appName=yuvraj";

const adminUser = {
  name: "Admin",
  email: "admin@yuvrajdocter.com",
  password: "YuvrajAdmin@2024",
  role: "admin"
};

const seedAdmin = async () => {
  try {
    // Connect to Production MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to Production MongoDB');

    // Import User model
    const UserModel = (await import('./models/UserModel.js')).default;

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      process.exit(0);
    }

    // Hash password and create admin
    const hashedPassword = await bcryptjs.hash(adminUser.password, 10);
    const newAdmin = new UserModel({
      ...adminUser,
      password: hashedPassword
    });
    
    await newAdmin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminUser.password);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();