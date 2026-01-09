import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authService from '../authService';
import api from '../api';

// Mock the api module
vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    default: {
      ...(actual as any).default,
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('loginUser', () => {
    it('should login user and store token and user data', async () => {
      const email = 'test@amazon.com';
      const password = 'password123';
      const mockResponse = {
        data: {
          token: 'jwt-token',
          _id: 'user123',
          username: 'testuser',
          email: 'test@amazon.com',
          isAdmin: false,
          jobTitle: 'Software Engineer',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.loginUser(email, password);

      expect(api.post).toHaveBeenCalledWith('/users/login', { email, password });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'jwt-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          _id: 'user123',
          username: 'testuser',
          email: 'test@amazon.com',
          isAdmin: false,
          jobTitle: 'Software Engineer',
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login without token', async () => {
      const email = 'test@amazon.com';
      const password = 'password123';
      const mockResponse = {
        data: {
          _id: 'user123',
          username: 'testuser',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      await authService.loginUser(email, password);

      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('token', expect.any(String));
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@amazon.com',
        password: 'password123',
      };
      const mockResponse = {
        data: {
          _id: 'user123',
          username: 'newuser',
          email: 'new@amazon.com',
          token: 'jwt-token',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.registerUser(userData);

      expect(api.post).toHaveBeenCalledWith('/users/register', userData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('logoutUser', () => {
    it('should remove token and user from localStorage', () => {
      authService.logoutUser();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getAllUsers', () => {
    it('should fetch all users', async () => {
      const mockResponse = {
        data: [
          { _id: 'user1', username: 'user1', email: 'user1@amazon.com' },
          { _id: 'user2', username: 'user2', email: 'user2@amazon.com' },
        ],
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await authService.getAllUsers();

      expect(api.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createNewUser', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@amazon.com',
        password: 'password123',
        isAdmin: false,
        jobTitle: 'Software Engineer',
      };
      const mockResponse = {
        data: {
          _id: 'user123',
          username: 'newuser',
          email: 'new@amazon.com',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.createNewUser(userData);

      expect(api.post).toHaveBeenCalledWith('/users', userData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = 'user123';
      const userData = {
        username: 'updateduser',
        email: 'updated@amazon.com',
        jobTitle: 'Project Manager',
      };
      const mockResponse = {
        data: {
          _id: userId,
          ...userData,
        },
      };

      (api.put as any).mockResolvedValue(mockResponse);

      const result = await authService.updateUser(userId, userData);

      expect(api.put).toHaveBeenCalledWith(`/users/${userId}`, userData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = 'user123';
      const mockResponse = {
        data: { message: 'User removed' },
      };

      (api.delete as any).mockResolvedValue(mockResponse);

      const result = await authService.deleteUser(userId);

      expect(api.delete).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });
});

