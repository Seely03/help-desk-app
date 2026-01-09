import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs'; 
import User from '../models/user.js';
import Project from '../models/project.js';
import Ticket from '../models/ticket.js';

import { CONSTANTS } from '../constants/Primitives.js'; 

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // 1. CLEAR EXISTING DATA
    console.log('🗑️  Clearing database...');
    await Ticket.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    // 2. CREATE USERS
   
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin', salt);
    const hashedUserPassword = await bcrypt.hash('user', salt);
    const hashedDevPassword = await bcrypt.hash('password123', salt);

    console.log('👤 Creating users...');
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@amazon.com',
      password: hashedAdminPassword, 
      isAdmin: true
    });

    const standardUser = await User.create({
      username: 'user',
      email: 'user@amazon.com',
      password: hashedUserPassword,
      isAdmin: false
    });

    const devNames = ['alice', 'bob', 'charlie'];
    const extraUsers = [];
    
    for (const name of devNames) {
      const user = await User.create({
        username: name,
        email: `${name}@amazon.com`,
        password: hashedDevPassword, 
        isAdmin: false
      });
      extraUsers.push(user);
    }

    const allUsers = [adminUser, standardUser, ...extraUsers];

    // 3. CREATE PROJECTS
    console.log('📂 Creating projects and tickets...');
    
    const projectNames = [
      'Website Redesign', 
      'Mobile App Refactor', 
      'Cloud Migration', 
      'Internal Audit Tool', 
      'Customer Portal'
    ];

    // GET VALID VALUES FROM CONSTANTS
    const validStatuses = Object.values(CONSTANTS.ENUMS.STATUS);
    const validPriorities = Object.values(CONSTANTS.ENUMS.PRIORITY);

    for (const name of projectNames) {
      // Create Project
      const project = await Project.create({
        name: name,
        description: `This is a randomly generated project description for ${name}.`,
        members: allUsers.map(u => u._id)
      });

      // 4. CREATE TICKETS
      for (let j = 1; j <= 5; j++) {
        const types = ['Bug', 'Feature', 'Task']; 
        const points = [1, 2, 3, 5, 8, 13];

        // Random selections ensuring validity
        const randomStatus = validStatuses[Math.floor(Math.random() * validStatuses.length)];
        const randomPriority = validPriorities[Math.floor(Math.random() * validPriorities.length)];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomPoint = points[Math.floor(Math.random() * points.length)];
        const randomAssignee = allUsers[Math.floor(Math.random() * allUsers.length)];

        await Ticket.create({
          title: `${randomType}: Fix issue in ${name}`, 
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Needed ASAP.',
          status: randomStatus,  
          priority: randomPriority,
          sizing: randomPoint,
          project: project._id,
          assignedTo: randomAssignee._id,
        });
      }
    }

    console.log('✅ Database Seeded Successfully!');
    process.exit();
    
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();