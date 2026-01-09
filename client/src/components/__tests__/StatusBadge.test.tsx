import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('should render status badge with correct text', () => {
    render(<StatusBadge status="Open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should apply correct colors for status values', () => {
    const { container: openContainer } = render(<StatusBadge status="Open" />);
    expect(openContainer.firstChild).toHaveClass('bg-green-100');

    const { container: inProgressContainer } = render(<StatusBadge status="In-Progress" />);
    expect(inProgressContainer.firstChild).toHaveClass('bg-purple-100');

    const { container: closedContainer } = render(<StatusBadge status="Closed" />);
    expect(closedContainer.firstChild).toHaveClass('bg-gray-100');
  });

  it('should apply correct colors for priority values', () => {
    const { container: highContainer } = render(<StatusBadge status="High" />);
    expect(highContainer.firstChild).toHaveClass('bg-red-100');

    const { container: mediumContainer } = render(<StatusBadge status="Medium" />);
    expect(mediumContainer.firstChild).toHaveClass('bg-yellow-100');

    const { container: lowContainer } = render(<StatusBadge status="Low" />);
    expect(lowContainer.firstChild).toHaveClass('bg-blue-100');
  });

  it('should handle case-insensitive status values', () => {
    render(<StatusBadge status="open" />);
    expect(screen.getByText('open')).toBeInTheDocument();

    render(<StatusBadge status="CLOSED" />);
    expect(screen.getByText('CLOSED')).toBeInTheDocument();
  });

  it('should apply default styling for unknown status', () => {
    const { container } = render(<StatusBadge status="Unknown" />);
    expect(container.firstChild).toHaveClass('bg-gray-100');
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});

