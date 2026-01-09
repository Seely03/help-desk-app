import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { protect, admin } from '../../middleware/authMiddleware.js';
import User from '../../models/user.js';

// Mock User model
jest.mock('../../models/user.js');

// Mock jwt with a factory to ensure default export is handled correctly
jest.mock('jsonwebtoken', () => {
  return {
    __esModule: true,
    default: {
      sign: jest.fn(),
      verify: jest.fn(),
    },
    sign: jest.fn(),
    verify: jest.fn(),
  };
});

const mockUser = User as any;
// Cast jwt to a type that includes Jest mocks
const mockJwt = jwt as unknown as { verify: jest.Mock; sign: jest.Mock };

describe('Auth Middleware', () => {
  let mockRequest: any;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: null,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    nextFunction = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('protect', () => {
    it('should call next if token is valid', async () => {
      mockRequest.headers.authorization = 'Bearer valid-token';

      const user = {
        _id: 'user123',
        username: 'testuser',
      };

      // Mock verify to return a decoded object
      mockJwt.verify.mockReturnValue({ id: 'user123' });

      // Mock the User.findById chain
      (mockUser.findById as any).mockReturnValue({
        select: jest.fn<any>().mockResolvedValue(user),
      });

      await protect(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockJwt.verify).toHaveBeenCalled();
      expect(mockUser.findById).toHaveBeenCalledWith('user123');
      expect(mockRequest.user).toEqual(user);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 401 if no token provided', async () => {
      mockRequest.headers.authorization = undefined;

      await protect(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';
      
      // Mock verify to throw an error
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protect(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      mockRequest.headers.authorization = 'Bearer valid-token';

      // Verify succeeds (returns valid ID)
      mockJwt.verify.mockReturnValue({ id: 'user123' });

      // FIX: Force the DB mock to REJECT instead of returning null.
      // This ensures the middleware catches the error and sends 401.
      (mockUser.findById as any).mockReturnValue({
        select: jest.fn<any>().mockRejectedValue(new Error('User not found')),
      });

      await protect(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    });
  });

  describe('admin', () => {
    it('should call next if user is admin', () => {
      mockRequest.user = { _id: 'admin123', isAdmin: true };

      admin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 401 if user is not admin', () => {
      mockRequest.user = { _id: 'user123', isAdmin: false };

      admin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});