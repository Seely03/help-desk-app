import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  registerUser,
  loginUser,
  searchUsers,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../../controllers/authController.js';
import User from '../../models/user.js';

// Mock dependencies
jest.mock('../../models/user.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUser = User as any;
const mockBcrypt = bcrypt as any;
const mockJwt = jwt as any;

describe('Auth Controller', () => {
  let mockRequest: any;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@amazon.com',
        password: 'password123',
      };

      mockRequest.body = userData;

      const hashedPassword = 'hashed-password';
      const token = 'jwt-token';
      const savedUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@amazon.com',
        jobTitle: 'Software Engineer',
        toString: () => 'user123',
      };

      (mockUser.findOne as any).mockResolvedValue(null);
      mockBcrypt.genSalt.mockResolvedValue('salt' as any);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as any);
      (mockUser.create as any).mockResolvedValue(savedUser);
      mockJwt.sign.mockReturnValue(token);

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockUser.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 'salt');
      expect(mockUser.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@amazon.com',
        password: hashedPassword,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        jobTitle: savedUser.jobTitle,
        token,
      });
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@amazon.com',
        password: 'password123',
      };

      mockRequest.body = userData;
      (mockUser.findOne as any).mockResolvedValue({ _id: 'existing' });

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User already exists' });
      expect(mockUser.create).not.toHaveBeenCalled();
    });

    it('should handle errors during registration', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@amazon.com',
        password: 'password123',
      };

      mockRequest.body = userData;
      (mockUser.findOne as any).mockRejectedValue(new Error('Database error'));

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Server error during registration' })
      );
    });
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@amazon.com',
        password: 'password123',
      };

      mockRequest.body = loginData;

      const user = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@amazon.com',
        password: 'hashed-password',
        isAdmin: false,
        jobTitle: 'Software Engineer',
        isActive: true,
        toString: () => 'user123',
      };

      const token = 'jwt-token';

      (mockUser.findOne as any).mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true as any);
      mockJwt.sign.mockReturnValue(token);

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockUser.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(mockResponse.json).toHaveBeenCalledWith({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        jobTitle: user.jobTitle,
        token,
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@amazon.com',
        password: 'wrongpassword',
      };

      mockRequest.body = loginData;

      const user = {
        _id: 'user123',
        password: 'hashed-password',
      };

      (mockUser.findOne as any).mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(false as any);

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should return 403 for deactivated account', async () => {
      const loginData = {
        email: 'test@amazon.com',
        password: 'password123',
      };

      mockRequest.body = loginData;

      const user = {
        _id: 'user123',
        password: 'hashed-password',
        isActive: false,
      };

      (mockUser.findOne as any).mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true as any);

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Account is deactivated. Contact admin.',
      });
    });
  });

  describe('searchUsers', () => {
    it('should return users matching the query', async () => {
      const query = 'test';
      mockRequest.query = { query };

      const users = [
        { _id: 'user1', username: 'testuser1', email: 'test1@amazon.com' },
        { _id: 'user2', username: 'testuser2', email: 'test2@amazon.com' },
      ];

      (mockUser.find as any).mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn<any>().mockResolvedValue(users),
        }),
      });

      await searchUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

    it('should return 400 if query is missing', async () => {
      mockRequest.query = {};

      await searchUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Query is required' });
    });
  });

  describe('createUser', () => {
    it('should create a new user as admin', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@amazon.com',
        password: 'password123',
        isAdmin: true,
        jobTitle: 'Project Manager',
      };

      mockRequest.body = userData;

      const savedUser = {
        _id: 'user123',
        username: 'newuser',
        email: 'new@amazon.com',
        isAdmin: true,
        jobTitle: 'Project Manager',
      };

      (mockUser.findOne as any).mockResolvedValue(null);
      mockBcrypt.genSalt.mockResolvedValue('salt' as any);
      mockBcrypt.hash.mockResolvedValue('hashed-password' as any);
      (mockUser.create as any).mockResolvedValue(savedUser);

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        isAdmin: savedUser.isAdmin,
        jobTitle: savedUser.jobTitle,
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without passwords', async () => {
      const users = [
        { _id: 'user1', username: 'user1', email: 'user1@amazon.com' },
        { _id: 'user2', username: 'user2', email: 'user2@amazon.com' },
      ];

      (mockUser.find as any).mockReturnValue({
        select: jest.fn<any>().mockResolvedValue(users),
      });

      await getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user123';
      mockRequest.params = { id: userId };
      mockRequest.body = {
        username: 'updateduser',
        email: 'updated@amazon.com',
        jobTitle: 'Support Engineer',
      };

      const user = {
        _id: userId,
        username: 'olduser',
        email: 'old@amazon.com',
        jobTitle: 'Software Engineer',
        isAdmin: false,
        isActive: true,
        save: jest.fn<any>().mockResolvedValue({
          _id: userId,
          username: 'updateduser',
          email: 'updated@amazon.com',
          jobTitle: 'Support Engineer',
          isAdmin: false,
          isActive: true,
        }),
      };

      (mockUser.findById as any).mockResolvedValue(user);

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'updateduser',
          email: 'updated@amazon.com',
          jobTitle: 'Support Engineer',
        })
      );
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (mockUser.findById as any).mockResolvedValue(null);

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user123';
      mockRequest.params = { id: userId };
      mockRequest.user = { _id: 'admin123' };

      const user = {
        _id: userId,
        deleteOne: jest.fn<any>().mockResolvedValue({}),
        toString: () => userId,
      };

      (mockUser.findById as any).mockResolvedValue(user);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(user.deleteOne).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User removed' });
    });

    it('should prevent user from deleting themselves', async () => {
      const userId = 'user123';
      mockRequest.params = { id: userId };
      mockRequest.user = { _id: userId };

      const user = {
        _id: userId,
        toString: () => userId,
      };

      (mockUser.findById as any).mockResolvedValue(user);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'You cannot delete yourself' });
    });
  });
});