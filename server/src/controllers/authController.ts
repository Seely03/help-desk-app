import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { CONSTANTS } from '../constants/primitives.js';

// Helper to generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const user = await User.create({
      username: username.toLowerCase(),
      email,
      password: hashedPassword
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        jobTitle: user.jobTitle,
        token: generateToken(user._id.toString()) // Send token so they are logged in immediately
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    // 1. Log the full error to your VS Code Terminal
    console.error("REGISTRATION ERROR DETAILS:", error);
  
    // 2. Send the specific message back to the frontend/Postman
    res.status(500).json({ 
      message: "Server error during registration",
      details: error.message,  // <--- The text description of the error
      error: error             // <--- The full error object
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });

    // 2. Check password
    // We verify the user exists AND the password matches the hash
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,     // crucial for your dashboard logic later
        jobTitle: user.jobTitle,   // helpful for displaying "Software Engineer", etc.
        token: generateToken(user._id.toString()),
      });
    } else {
      // Security note: Don't specify if it was the email or password that was wrong
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};