import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createProject,
  getProjects,
  getProjectById,
  addMember,
} from '../../controllers/projectController.js';
import Project from '../../models/project.js';
import User from '../../models/user.js';

// Mock dependencies
jest.mock('../../models/project.js');
jest.mock('../../models/user.js');

const mockProject = Project as any;
const mockUser = User as any;

describe('Project Controller', () => {
  let mockRequest: any;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { id: 'user123' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    jest.clearAllMocks();
  });

  // ... (createProject, getProjects, getProjectById tests remain valid from previous steps) ...
  // Re-including them here for a complete file copy-paste
  
  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const projectData = { name: 'Test Project', description: 'Test Description' };
      mockRequest.body = projectData;

      const savedProject = {
        _id: 'project123',
        name: 'Test Project',
        description: 'Test Description',
        members: ['user123'],
      };

      const projectInstance = {
        save: jest.fn<any>().mockResolvedValue(savedProject),
      };

      (mockProject as any).mockImplementation(() => projectInstance);
      (mockUser.findByIdAndUpdate as any).mockResolvedValue({});

      await createProject(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project created successfully',
        project: savedProject,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.body = { name: 'Test Project' };
      await createProject(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should return 400 for invalid project data', async () => {
      mockRequest.body = { name: '' };
      await createProject(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle server errors', async () => {
      mockRequest.body = { name: 'Test Project' };
      (mockProject as any).mockImplementation(() => { throw new Error('DB Error'); });
      await createProject(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getProjects', () => {
    it('should return projects for the authenticated user', async () => {
      const projects = [{ _id: 'p1', name: 'P1' }];
      (mockProject.find as any).mockReturnValue({
        sort: jest.fn<any>().mockResolvedValue(projects),
      });
      await getProjects(mockRequest as Request, mockResponse as Response);
      expect(mockProject.find).toHaveBeenCalledWith({ members: 'user123' });
      expect(mockResponse.json).toHaveBeenCalledWith(projects);
    });

    it('should handle errors', async () => {
      (mockProject.find as any).mockReturnValue({
        sort: jest.fn<any>().mockRejectedValue(new Error('DB Error')),
      });
      await getProjects(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getProjectById', () => {
    it('should return a project by id', async () => {
      const project = { _id: 'p1' };
      mockRequest.params = { id: 'p1' };
      (mockProject.findById as any).mockReturnValue({
        populate: jest.fn<any>().mockResolvedValue(project),
      });
      await getProjectById(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.json).toHaveBeenCalledWith(project);
    });

    it('should return 404 if not found', async () => {
      mockRequest.params = { id: 'p1' };
      (mockProject.findById as any).mockReturnValue({
        populate: jest.fn<any>().mockResolvedValue(null),
      });
      await getProjectById(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });


  describe('addMember', () => {
    it('should add a member to a project', async () => {
      const projectId = 'project123';
      const userId = 'user456';

      mockRequest.params = { id: projectId };
      mockRequest.body = { userId };

      // Spy on push
      const pushMock = jest.fn();
      
      const project = {
        _id: projectId,
        members: {
          includes: jest.fn().mockReturnValue(false),
          push: pushMock,
        },
        save: jest.fn<any>().mockResolvedValue({}),
      };

      const updatedProject = {
        _id: projectId,
        members: ['user123', userId],
      };

      // Call 1: Project.findById(id) -> returns Promise<project>
      // Call 2: Project.findById(id).populate(...) -> returns Query object with .populate
      (mockProject.findById as any)
        .mockResolvedValueOnce(project) // First call matches 'await Project.findById'
        .mockReturnValueOnce({          // Second call matches 'Project.findById(...).populate'
           populate: jest.fn<any>().mockResolvedValue(updatedProject)
        });

      (mockUser.findByIdAndUpdate as any).mockResolvedValue({});

      await addMember(mockRequest as Request, mockResponse as Response);

      expect(pushMock).toHaveBeenCalledWith(userId);
      expect(project.save).toHaveBeenCalled();
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $addToSet: { projects: projectId },
      });
    });

    it('should return 404 if project not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { userId: 'user456' };

      // Just one call needed here, returning null
      (mockProject.findById as any).mockResolvedValue(null);

      await addMember(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should return 400 if user is already a member', async () => {
      const projectId = 'project123';
      const userId = 'user456';

      mockRequest.params = { id: projectId };
      mockRequest.body = { userId };

      const project = {
        _id: projectId,
        members: {
          includes: jest.fn().mockReturnValue(true),
        },
      };

      (mockProject.findById as any).mockResolvedValue(project);

      await addMember(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User is already a member' });
    });
  });
});