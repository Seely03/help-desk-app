import { AuthRequest } from '../middleware/authMiddleware.js';
import { Request, Response } from 'express';
import Ticket from '../models/ticket.js'; // Note the .js extension for local imports in Node ESM

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Public (We will secure this later)
export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    // Attempt to find all tickets in the DB
    const tickets = await Ticket.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to fetch tickets' });
  }
};

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Public
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // We no longer need 'userEmail' from the body
      const { title, description, priority, sizing } = req.body;
  
      // Security Check: Ensure user exists (Middleware should have caught this, but double check)
      if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }
  
      const ticket = new Ticket({
        title,
        description,
        priority,
        sizing,
        userEmail: req.user.email, // <--- AUTOMATICALLY SET FROM TOKEN
        status: 'Open'
      });
  
      const savedTicket = await ticket.save();
      res.status(201).json(savedTicket);
    } catch (error) {
      if (error instanceof Error) {
          res.status(400).json({ message: error.message });
      } else {
          res.status(400).json({ message: 'Invalid Ticket Data' });
      }
    }
  };