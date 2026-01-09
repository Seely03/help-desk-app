import { Request, Response } from 'express';
import { z } from 'zod';
import Project from '../models/project.js';
import User from '../models/user.js';
import { ProjectTitle, ProjectDescription } from '../constants/Primitives.js';

// 1. Define the Zod Schema for this specific request
// We compose this using the Primitives we already built
const CreateProjectSchema = z.object({
  name: ProjectTitle,
  description: ProjectDescription.optional(), // Description is optional
});

export const createProject = async (req: Request, res: Response) => {
  try {
    // --- A. VALIDATION LAYER ---
    // If this fails, Zod throws an error immediately
    const validatedData = CreateProjectSchema.parse(req.body);
    
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

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Find projects where the 'members' array contains this user's ID
    const projects = await Project.find({ members: userId })
      .sort({ createdAt: -1 }); // Newest first

    res.json(projects);
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/projects/:id
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate('members', 'username email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Project ID
    const { userId } = req.body; // User to add

    // 1. Find Project
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // 2. Check if already a member
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // 3. Add to Project
    project.members.push(userId);
    await project.save();

    // 4. Add Project to User (Two-way sync)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { projects: project._id }
    });

    // Return the updated project with populated members so UI updates instantly
    const updatedProject = await Project.findById(id).populate('members', 'username email jobTitle');
    
    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};