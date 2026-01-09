import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import * as authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', async () => {
  const actual = await vi.importActual('../../services/authService');
  return {
    ...actual,
    loginUser: vi.fn(),
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
  };

  it('should render login form with email and password fields', () => {
    renderLoginForm();

    expect(screen.getByPlaceholderText('test@amazon.com')).toBeInTheDocument();
    // Password field doesn't have placeholder, find by label text then get the input
    const passwordLabel = screen.getByText(/password/i);
    expect(passwordLabel).toBeInTheDocument();
    const passwordInput = passwordLabel.parentElement?.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show error message when login fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';

    (authService.loginUser as any).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    renderLoginForm();

    await user.type(screen.getByPlaceholderText('test@amazon.com'), 'test@amazon.com');
    const passwordLabel = screen.getByText(/password/i);
    const passwordInput = passwordLabel.parentElement?.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(passwordInput!, 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should navigate to dashboard on successful login', async () => {
    const user = userEvent.setup();
    const mockUserData = {
      token: 'jwt-token',
      _id: 'user123',
      username: 'testuser',
      email: 'test@amazon.com',
    };

    (authService.loginUser as any).mockResolvedValue(mockUserData);

    renderLoginForm();

    await user.type(screen.getByPlaceholderText('test@amazon.com'), 'test@amazon.com');
    const passwordLabel = screen.getByText(/password/i);
    const passwordInput = passwordLabel.parentElement?.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(passwordInput!, 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalledWith('test@amazon.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should require email and password fields', () => {
    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('test@amazon.com');
    const passwordLabel = screen.getByText(/password/i);
    const passwordInput = passwordLabel.parentElement?.querySelector('input[type="password"]') as HTMLInputElement;

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should show link to register page', () => {
    renderLoginForm();

    const registerLink = screen.getByRole('link', { name: /sign up/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});

