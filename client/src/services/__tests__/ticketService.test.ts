import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as ticketService from '../ticketService';
import api from '../api';

// Mock the api module
vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    default: {
      ...(actual as any).default,
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

describe('Ticket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTicketComments', () => {
    it('should fetch comments for a ticket', async () => {
      const ticketId = 'ticket123';
      const mockResponse = {
        data: [
          {
            _id: 'comment1',
            content: 'First comment',
            author: { username: 'user1' },
            createdAt: '2024-01-01',
          },
          {
            _id: 'comment2',
            content: 'Second comment',
            author: { username: 'user2' },
            createdAt: '2024-01-02',
          },
        ],
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await ticketService.getTicketComments(ticketId);

      expect(api.get).toHaveBeenCalledWith(`/tickets/${ticketId}/comments`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors when fetching comments', async () => {
      const ticketId = 'ticket123';
      const error = new Error('Failed to fetch comments');

      (api.get as any).mockRejectedValue(error);

      await expect(ticketService.getTicketComments(ticketId)).rejects.toThrow('Failed to fetch comments');
    });
  });

  describe('addTicketComment', () => {
    it('should add a comment to a ticket', async () => {
      const ticketId = 'ticket123';
      const content = 'This is a new comment';
      const mockResponse = {
        data: {
          _id: 'comment123',
          content,
          ticket: ticketId,
          author: { username: 'testuser', _id: 'user123' },
          createdAt: '2024-01-01',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await ticketService.addTicketComment(ticketId, content);

      expect(api.post).toHaveBeenCalledWith(`/tickets/${ticketId}/comments`, { content });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors when adding a comment', async () => {
      const ticketId = 'ticket123';
      const content = 'This is a new comment';
      const error = new Error('Failed to add comment');

      (api.post as any).mockRejectedValue(error);

      await expect(ticketService.addTicketComment(ticketId, content)).rejects.toThrow('Failed to add comment');
    });
  });
});

