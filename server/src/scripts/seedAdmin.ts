import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js'; // Adjust path if needed

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected');

    const emailToPromote = 'test@amazon.com'; 

    const user = await User.findOneAndUpdate(
      { email: emailToPromote },
      { isAdmin: true },
      { new: true }
    );

    if (user) {
      console.log(`✅ Success! User ${user.username} is now an Admin.`);
    } else {
      console.log(`❌ User with email ${emailToPromote} not found.`);
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();