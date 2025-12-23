import { Request, Response } from 'express';
import { z } from 'zod';
import Project from '../models/project.js';
import User from '../models/user.js';
import { ProjectTitle, ProjectDescription } from '../constants/primitives.js';

// 1. Define the Zod Schema for this specific request
// We compose this using the primitives we already built
const CreateProjectSchema = z.object({
  name: ProjectTitle,
  description: ProjectDescription.optional(), // Description is optional
});

export const createProject = async (req: Request, res: Response) => {
  try {
    // --- A. VALIDATION LAYER ---
    // If this fails, Zod throws an error immediately
    const validatedData = CreateProjectSchema.parse(req.body);
    
    // We assume your Auth Middleware has attached the user to the request
    // e.g., req.user.id
    // If you haven't set up the interface for req.user yet, we'll cast it for now
    const userId = (req as any).user?.id; 

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // --- B. DATABASE LAYER ---
    
    // 1. Create the Project Object
    // We automatically add the creator as the first member
    const newProject = new Project({
      name: validatedData.name,
      description: validatedData.description,
      members: [userId] 
    });

    // 2. Save the Project
    const savedProject = await newProject.save();

    // 3. Update the User (Two-way Sync)
    // We must tell the User document that it belongs to this new project
    await User.findByIdAndUpdate(userId, {
      $push: { projects: savedProject._id }
    });

    // --- C. RESPONSE ---
    return res.status(201).json({
      message: 'Project created successfully',
      project: savedProject
    });

  } catch (error) {
    // Handle Zod Validation Errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }

    // Handle Generic Server Errors
    console.error('Create Project Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};