import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createTicket,
  getTickets,
  updateTicket,
  getTicketById,
} from '../../controllers/ticketController.js';
import Ticket from '../../models/ticket.js';
import Project from '../../models/project.js';
import User from '../../models/user.js';
import Comment from '../../models/comment.js';

// Mock dependencies
jest.mock('../../models/ticket.js');
jest.mock('../../models/project.js');
jest.mock('../../models/user.js');
jest.mock('../../models/comment.js');

const mockTicket = Ticket as any;
const mockProject = Project as any;
const mockUser = User as any;
const mockComment = Comment as any;

describe('Ticket Controller', () => {
  let mockRequest: any;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123', _id: 'user123' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'High',
        projectId: 'project123',
      };

      mockRequest.body = ticketData;

      const project = {
        _id: 'project123',
        name: 'Test Project',
        members: ['user123'],
      };

      const savedTicket = {
        _id: 'ticket123',
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'High',
        status: 'Open',
        project: 'project123',
      };

      (mockProject.findById as any).mockResolvedValue(project);

      const ticketInstance = {
        save: jest.fn<any>().mockResolvedValue(savedTicket),
      };

      (mockTicket as any).mockImplementation(() => ticketInstance);
      (mockUser.findByIdAndUpdate as any).mockResolvedValue({});

      await createTicket(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Ticket created successfully',
        ticket: savedTicket,
      });
    });

    it('should return 404 if project not found', async () => {
      mockRequest.body = {
        title: 'Test Ticket',
        projectId: 'nonexistent',
      };

      (mockProject.findById as any).mockResolvedValue(null);

      await createTicket(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should return 400 for invalid ticket data', async () => {
      mockRequest.body = { title: '' }; // Invalid: empty title

      await createTicket(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ errors: expect.any(Array) })
      );
    });
  });

  describe('getTickets', () => {
    it('should return all tickets when no filters provided', async () => {
      const tickets = [
        { _id: 'ticket1', title: 'Ticket 1', status: 'Open' },
        { _id: 'ticket2', title: 'Ticket 2', status: 'Closed' },
      ];

      (mockTicket.find as any).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({

            sort: jest.fn<any>().mockResolvedValue(tickets),
          }),
        }),
      });

      await getTickets(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(tickets);
    });

    it('should filter tickets by projectId', async () => {
      mockRequest.query = { projectId: 'project123' };

      const tickets = [{ _id: 'ticket1', title: 'Ticket 1', project: 'project123' }];

      (mockTicket.find as any).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({

            sort: jest.fn<any>().mockResolvedValue(tickets),
          }),
        }),
      });

      await getTickets(mockRequest as Request, mockResponse as Response);

      expect(mockTicket.find).toHaveBeenCalledWith({ project: 'project123' });
    });

    it('should filter tickets by status', async () => {
      mockRequest.query = { status: 'Open' };

      const tickets = [{ _id: 'ticket1', title: 'Ticket 1', status: 'Open' }];

      (mockTicket.find as any).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({

            sort: jest.fn<any>().mockResolvedValue(tickets),
          }),
        }),
      });

      await getTickets(mockRequest as Request, mockResponse as Response);

      expect(mockTicket.find).toHaveBeenCalledWith({ status: 'Open' });
    });
  });

  describe('updateTicket', () => {
    it('should update ticket successfully', async () => {
      const ticketId = 'ticket123';
      mockRequest.params = { id: ticketId };
      mockRequest.body = { status: 'In-Progress' };

      const oldTicket = {
        _id: ticketId,
        status: 'Open',
        priority: 'Medium',
        assignedTo: null,
      };

      const updatedTicket = {
        _id: ticketId,
        status: 'In-Progress',
        priority: 'Medium',
        assignedTo: null,
        project: { name: 'Test Project' },
      };

      (mockTicket.findById as any).mockResolvedValue(oldTicket);
      (mockTicket.findByIdAndUpdate as any).mockReturnValue({
        populate: jest.fn().mockReturnValue({

          populate: jest.fn<any>().mockResolvedValue(updatedTicket),
        }),
      });
      (mockComment.create as any).mockResolvedValue({});

      await updateTicket(mockRequest as Request, mockResponse as Response);

      expect(mockComment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('changed status'),
          ticket: ticketId,
          author: 'user123',
          isSystem: true,
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedTicket);
    });

    it('should create comment for priority change', async () => {
      const ticketId = 'ticket123';
      mockRequest.params = { id: ticketId };
      mockRequest.body = { priority: 'High' };

      const oldTicket = {
        _id: ticketId,
        status: 'Open',
        priority: 'Medium',
        assignedTo: null,
      };

      const updatedTicket = {
        _id: ticketId,
        status: 'Open',
        priority: 'High',
        assignedTo: null,
        project: { name: 'Test Project' },
      };

      (mockTicket.findById as any).mockResolvedValue(oldTicket);
      (mockTicket.findByIdAndUpdate as any).mockReturnValue({
        populate: jest.fn().mockReturnValue({

          populate: jest.fn<any>().mockResolvedValue(updatedTicket),
        }),
      });
      (mockComment.create as any).mockResolvedValue({});

      await updateTicket(mockRequest as Request, mockResponse as Response);

      expect(mockComment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('changed priority'),
          ticket: ticketId,
          author: 'user123',
          isSystem: true,
        })
      );
    });

    it('should return 404 if ticket not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { status: 'Closed' };

      (mockTicket.findById as any).mockResolvedValue(null);

      await updateTicket(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Ticket not found' });
    });
  });

  describe('getTicketById', () => {
    it('should return a ticket by id', async () => {
      const ticketId = 'ticket123';
      mockRequest.params = { id: ticketId };

      const ticket = {
        _id: ticketId,
        title: 'Test Ticket',
        status: 'Open',
        assignedTo: { username: 'testuser', email: 'test@amazon.com' },
        project: {
          name: 'Test Project',
          members: [{ username: 'user1', email: 'user1@amazon.com' }],
        },
      };

      (mockTicket.findById as any).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn<any>().mockResolvedValue(ticket),
        }),
      });

      await getTicketById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(ticket);
    });

    it('should return 404 if ticket not found', async () => {
      mockRequest.params = { id: 'nonexistent' };

      (mockTicket.findById as any).mockReturnValue({
        populate: jest.fn().mockReturnValue({

          populate: jest.fn<any>().mockResolvedValue(null),
        }),
      });

      await getTicketById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Ticket not found' });
    });
  });
});