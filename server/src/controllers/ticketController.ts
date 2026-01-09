import { Request, Response } from 'express';
import { z } from 'zod';
import Ticket from '../models/ticket.js';
import Project from '../models/project.js';
import User from '../models/user.js';
import {
  TicketTitle,
  TicketPriority,
  TicketStatus,
  CONSTANTS
} from '../constants/Primitives.js';
import Comment from '../models/comment.js';

// 1. Zod Schema for Creating a Ticket
const CreateTicketSchema = z.object({
  title: TicketTitle,
  description: z.string()
    .max(CONSTANTS.TICKET.DESC_MAX)
    .regex(CONSTANTS.REGEX.NO_HTML)
    .optional(),
  priority: TicketPriority.optional(),
  status: TicketStatus.optional(),
  projectId: z.string().min(1, "Project ID is required"), // We need to know where this ticket lives
  assignedTo: z.string().optional(),
});

export const createTicket = async (req: Request, res: Response) => {
  try {
    // --- A. VALIDATION ---
    const validatedData = CreateTicketSchema.parse(req.body);
    const userId = (req as any).user?.id; // The user creating the ticket

    // --- B. LOGIC CHECKS ---

    // 1. Does the Project exist?
    const project = await Project.findById(validatedData.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // --- C. DATABASE ACTION ---

    // 2. Create the Ticket
    const newTicket = new Ticket({
      title: validatedData.title,
      description: validatedData.description,
      priority: validatedData.priority || 'Medium',
      status: validatedData.status || 'Open',
      project: validatedData.projectId,
      assignedTo: validatedData.assignedTo || null
    });

    const savedTicket = await newTicket.save();

    // 3. Handle Assignment (Update User Model)
    // If the ticket was assigned to someone, we need to update that User's "assignedTickets" list
    if (validatedData.assignedTo) {
      await User.findByIdAndUpdate(validatedData.assignedTo, {
        $push: { assignedTickets: savedTicket._id }
      });
    }

    return res.status(201).json({
      message: 'Ticket created successfully',
      ticket: savedTicket
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error('Create Ticket Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    // 1. Extract Query Parameters
    // e.g. /api/tickets?projectId=123&status=Open
    const { projectId, assignedTo, status, priority } = req.query;

    // 2. Build the Filter Object dynamically
    const filter: any = {};

    if (projectId) {
      filter.project = projectId;
    }
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }

    // 3. Fetch from Database
    const tickets = await Ticket.find(filter)
      // .populate() replaces the ID with actual data from the other collection
      .populate('assignedTo', 'username email jobTitle') // Get User details
      .populate('project', 'name') // Get Project name
      .sort({ createdAt: -1 }); // Newest first

    return res.status(200).json(tickets);

  } catch (error) {
    console.error('Get Tickets Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// PUT /api/tickets/:id
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = (req as any).user._id; // The person making the change

    // 1. Get the OLD ticket (before update) so we can compare
    const oldTicket = await Ticket.findById(id);
    if (!oldTicket) return res.status(404).json({ message: 'Ticket not found' });

    if (updates.assignedTo === "") {
      updates.assignedTo = null;
    }

    // 2. Perform the Update
    const updatedTicket = await Ticket.findByIdAndUpdate(id, updates, { new: true })
      .populate('assignedTo', 'username')
      .populate('project', 'name members');

    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    // 3. DETECT CHANGES & CREATE AUDIT LOGS


    // Check Status Change
    if (updates.status && updates.status !== oldTicket.status) {
      await Comment.create({
        content: ` changed status from "${oldTicket.status}" to "${updates.status}"`,
        ticket: id,
        author: userId,
        isSystem: true
      });
    }

    // Check Priority Change
    if (updates.priority && updates.priority !== oldTicket.priority) {
      await Comment.create({
        content: `changed priority to "${updates.priority}"`,
        ticket: id,
        author: userId,
        isSystem: true
      });
    }

    // Check Assignment Change
    // Note: We compare strings because ObjectIds are objects
    const oldAssigneeId = oldTicket.assignedTo ? oldTicket.assignedTo.toString() : null;
    const newAssigneeId = updates.assignedTo ? updates.assignedTo.toString() : null;

    // Only log if the field was actually sent in the request AND the value changed
    if (updates.assignedTo !== undefined && oldAssigneeId !== newAssigneeId) {
      let logContent = '';

      if (updatedTicket.assignedTo) {
        const newAssigneeName = (updatedTicket.assignedTo as any).username;
        logContent = `assigned to "${newAssigneeName}"`;
      } else {
        logContent = `unassigned the ticket`;
      }

      await Comment.create({
        content: logContent,
        ticket: id,
        author: userId,
        isSystem: true
      });
    }

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/tickets/:id
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedTo', 'username email') // Populate the assignee
      .populate({
        path: 'project',
        select: 'name members', // Get project name and members
        populate: {
          path: 'members', // nested populate: turn member IDs into User objects
          select: 'username email'
        }
      });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};