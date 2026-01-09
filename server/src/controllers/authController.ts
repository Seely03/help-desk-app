import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { CONSTANTS } from '../constants/Primitives.js';

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
      details: error.message,
      error: error 
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // 1. Check if user exists and password matches
    if (user && (await bcrypt.compare(password, user.password))) {

      // 2. CHECK STATUS: Stop here if they are deactivated
      if (user.isActive === false) {
        res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
        return;
      }

      // 3. Success - Send Token
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        jobTitle: user.jobTitle,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Find users where username contains the query (case-insensitive)
    // We only return _id, username, and email for security
    // Inside searchUsers function
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      isActive: true
    })
      .select('_id username email jobTitle')
      .limit(10); // Limit results to avoid massive payloads

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, isAdmin, jobTitle } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password (or generate a random one if you prefer)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: username.toLowerCase(),
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false, // Admin can decide privileges
      jobTitle: jobTitle || 'Software Engineer'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        jobTitle: user.jobTitle
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password'); // Don't send passwords back
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // 1. Update basic fields only if they are provided and NOT empty
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.jobTitle = req.body.jobTitle || user.jobTitle;

      // 2. Handle Admin Status
      if (req.body.isAdmin !== undefined) {
        user.isAdmin = req.body.isAdmin;
      }

      // 3. Handle Active Status
      if (req.body.isActive !== undefined) {
        user.isActive = req.body.isActive;
      }

      // 4. Handle Password Update (Only if a new password is typed)
      if (req.body.password && req.body.password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isActive: updatedUser.isActive,
        jobTitle: updatedUser.jobTitle,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    // 5. Catch Duplicate Key Errors (e.g. Email already taken)
    if (error.code === 11000) {
       console.error("Duplicate Key Error:", error);
       res.status(400).json({ message: 'Username or Email already exists' });
    } else {
       console.error("Update User Error:", error);
       res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent deleting yourself (accidentally locking yourself out)
      // Note: req.user.id is coming from the 'protect' middleware
      if (user._id.toString() === (req as any).user._id.toString()) {
        return res.status(400).json({ message: "You cannot delete yourself" });
      }

      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};