import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketForm from '../TicketForm';
import { AuthProvider } from '../../context/AuthContext';

// Mock fetch
(global as any).fetch = vi.fn();

// Mock AuthContext to provide user
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: {
        _id: 'user123',
        username: 'testuser',
        email: 'test@amazon.com',
        token: 'jwt-token',
      },
    }),
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => JSON.stringify({
    _id: 'user123',
    username: 'testuser',
    email: 'test@amazon.com',
    token: 'jwt-token',
  })),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('TicketForm', () => {
  const mockOnTicketCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  const renderTicketForm = () => {
    return render(
      <AuthProvider>
        <TicketForm onTicketCreated={mockOnTicketCreated} />
      </AuthProvider>
    );
  };

  it('should render all form fields', () => {
    renderTicketForm();

    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/issue title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit ticket/i })).toBeInTheDocument();
  });

  it('should create ticket on form submission', async () => {
    const user = userEvent.setup();
    const mockTicket = {
      _id: 'ticket123',
      title: 'New Ticket',
      description: 'Ticket description',
      priority: 'High',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTicket,
    });

    // Mock alert
    window.alert = vi.fn();

    renderTicketForm();

    await user.type(screen.getByPlaceholderText(/your email/i), 'test@amazon.com');
    await user.type(screen.getByPlaceholderText(/issue title/i), 'New Ticket');
    await user.type(screen.getByPlaceholderText(/description/i), 'Ticket description');
    await user.click(screen.getByRole('button', { name: /submit ticket/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/tickets',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer jwt-token',
          }),
        })
      );
    });
  });

  it('should handle fetch errors gracefully', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderTicketForm();

    await user.type(screen.getByPlaceholderText(/your email/i), 'test@amazon.com');
    await user.type(screen.getByPlaceholderText(/issue title/i), 'New Ticket');
    await user.type(screen.getByPlaceholderText(/description/i), 'Ticket description');
    await user.click(screen.getByRole('button', { name: /submit ticket/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error creating ticket');
    }, { timeout: 3000 });

    alertSpy.mockRestore();
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    const mockTicket = {
      _id: 'ticket123',
      title: 'New Ticket',
      description: 'Ticket description',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTicket,
    });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderTicketForm();

    const titleInput = screen.getByPlaceholderText(/issue title/i) as HTMLInputElement;
    const descriptionInput = screen.getByPlaceholderText(/description/i) as HTMLTextAreaElement;
    
    const emailInput = screen.getByPlaceholderText(/your email/i);
    await user.type(emailInput, 'test@amazon.com'); 

    await user.type(titleInput, 'New Ticket');
    await user.type(descriptionInput, 'Ticket description');
    
    await user.click(screen.getByRole('button', { name: /submit ticket/i }));

    // Wait for the alert to be called
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Ticket Created Successfully!');
    });

    // Then check that form was reset
    await waitFor(() => {
      expect(titleInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
      // You might also want to check if email was reset, depending on your logic
    }, { timeout: 1000 });

    alertSpy.mockRestore();
  });
});
