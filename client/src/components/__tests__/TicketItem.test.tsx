import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TicketItem from '../TicketItem';
import api from '../../services/api';

// Mock the api module
vi.mock('../../services/api', async () => {
  const actual = await vi.importActual('../../services/api');
  return {
    default: {
      ...(actual as any).default,
      put: vi.fn(),
    },
  };
});

describe('TicketItem', () => {
  const mockTicket = {
    _id: 'ticket123',
    title: 'Test Ticket',
    description: 'Test Description',
    status: 'Open',
    priority: 'Medium',
    assignedTo: null,
  };

  const mockProjectMembers = [
    { _id: 'user1', username: 'user1' },
    { _id: 'user2', username: 'user2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderTicketItem = () => {
    return render(
      <BrowserRouter>
        <TicketItem ticket={mockTicket} projectMembers={mockProjectMembers} />
      </BrowserRouter>
    );
  };

  it('should render ticket title and description', () => {
    renderTicketItem();

    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should display status badge', () => {
    renderTicketItem();

    // Find the status badge (not the dropdown option)
    const statusBadges = screen.getAllByText('Open');
    // The badge should be in a span with StatusBadge styling
    const badge = statusBadges.find(el => 
      el.tagName === 'SPAN' && 
      el.className.includes('rounded-full')
    );
    expect(badge).toBeInTheDocument();
  });

  it('should display priority badge', () => {
    renderTicketItem();

    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('should update status when status dropdown changes', async () => {
    const user = userEvent.setup();
    (api.put as any).mockResolvedValue({ data: { ...mockTicket, status: 'In-Progress' } });

    renderTicketItem();

    const statusSelect = screen.getByDisplayValue('Open');
    await user.selectOptions(statusSelect, 'In-Progress');

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/tickets/ticket123', { status: 'In-Progress' });
    });
  });

  it('should update assignment when assignee dropdown changes', async () => {
    const user = userEvent.setup();
    (api.put as any).mockResolvedValue({ data: { ...mockTicket, assignedTo: 'user1' } });

    renderTicketItem();

    // Find the assignee select by finding the select that contains "Unassigned" option
    const selects = screen.getAllByRole('combobox');
    const assignSelect = selects.find(select => 
      Array.from(select.querySelectorAll('option')).some(opt => opt.textContent === 'Unassigned')
    ) || selects[0];
    
    await user.selectOptions(assignSelect, 'user1');

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/tickets/ticket123', { assignedTo: 'user1' });
    });
  });

  it('should display link to ticket details', () => {
    renderTicketItem();

    const link = screen.getByRole('link', { name: /test ticket/i });
    expect(link).toHaveAttribute('href', '/tickets/ticket123');
  });

  it('should show unassigned option in assignee dropdown', () => {
    renderTicketItem();

    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('should display all project members in assignee dropdown', () => {
    renderTicketItem();

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });
});

