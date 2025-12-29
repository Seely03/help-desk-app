import { Request, Response } from 'express';
import Comment from '../models/comment.js';
import Ticket from '../models/ticket.js';

// POST /api/tickets/:ticketId/comments
export const addComment = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const { ticketId } = req.params;
    const userId = (req as any).user._id;

    // 1. Verify Ticket Exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // 2. Create Comment
    const comment = await Comment.create({
      content,
      ticket: ticketId,
      author: userId
    });

    // 3. Populate Author details (so we can show "Adam said..." immediately)
    await comment.populate('author', 'username jobTitle');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/tickets/:ticketId/comments
export const getComments = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const comments = await Comment.find({ ticket: ticketId })
      .populate('author', 'username jobTitle') // Get user info
      .sort({ createdAt: 1 }); // Oldest first (like a chat log)

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};