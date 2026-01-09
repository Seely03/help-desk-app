import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import * as authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', async () => {
  const actual = await vi.importActual('../../services/authService');
  return {
    ...actual,
    registerUser: vi.fn(),
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegisterForm = () => {
    return render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );
  };

  it('should render registration form with all required fields', () => {
    renderRegisterForm();

    expect(screen.getByPlaceholderText('jdoe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('user@amazon.com')).toBeInTheDocument();
    // Password field doesn't have placeholder, find by label text then get the input
    const passwordLabel = screen.getByText(/password/i);
    expect(passwordLabel).toBeInTheDocument();
    const passwordInput = passwordLabel.parentElement?.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should show error message when registration fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'User already exists';

    (authService.registerUser as any).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    renderRegisterForm();

    await user.type(screen.getByPlaceholderText('jdoe'), 'testuser');
    await user.type(screen.getByPlaceholderText('user@amazon.com'), 'test@amazon.com');
    const passwordLabel = screen.getByText(/password/i);
    const passwordInput = passwordLabel.parentElement?.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(passwordInput!, 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should navigate to login on successful registration', async () => {
    const user = userEvent.setup();
    const mockUserData = {
      token: 'jwt-token',
      _id: 'user123',
      username: 'testuser',
      email: 'test@amazon.com',
    };

    (authService.registerUser as any).mockResolvedValue(mockUserData);

    // Mock window.alert
    window.alert = vi.fn();

    renderRegisterForm();

    await user.type(screen.getByPlaceholderText('jdoe'), 'testuser');
    await user.type(screen.getByPlaceholderText('user@amazon.com'), 'test@amazon.com');
    const passwordLabel = screen.getByText(/password/i);
    const passwordInput = passwordLabel.parentElement?.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(passwordInput!, 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(authService.registerUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@amazon.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should require all form fields', () => {
    renderRegisterForm();

    const usernameInput = screen.getByPlaceholderText('jdoe');
    const emailInput = screen.getByPlaceholderText('user@amazon.com');
    const passwordLabel = screen.getByText(/password/i);
    const passwordInput = passwordLabel.parentElement?.querySelector('input[type="password"]') as HTMLInputElement;

    expect(usernameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should show link to login page', () => {
    renderRegisterForm();

    const loginLink = screen.getByRole('link', { name: /login here/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});

