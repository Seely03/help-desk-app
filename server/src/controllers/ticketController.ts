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
} from '../constants/primitives.js';

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
  assignedTo: z.string().optional(), // Optional: Assign to a user ID immediately
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

    // (Optional Enhancement: Check if the user is a member of the project?)
    // if (!project.members.includes(userId)) { ... }

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