import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import InnovationTalos from '@/pages/InnovationTalos';

// Mock components
vi.mock('@/components/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

vi.mock('@/components/GoldButton', () => ({
  GoldButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="gold-button">
      {children}
    </button>
  ),
}));

vi.mock('wouter', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('InnovationTalos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders page with title and description', () => {
    render(<InnovationTalos />);

    expect(screen.getByText('Talos Humanoid Robotics')).toBeDefined();
    expect(screen.getByText('Autonomous Labor for Manufacturing')).toBeDefined();
  });

  it('displays badges for key features', () => {
    render(<InnovationTalos />);

    expect(screen.getByText('95% Labor Cost Reduction')).toBeDefined();
    // May appear in multiple places
    const operationBadges = screen.getAllByText('24/7 Operation');
    expect(operationBadges.length).toBeGreaterThan(0);
    expect(screen.getByText('Optimus + Figure')).toBeDefined();
  });

  it('renders navigation and back button', () => {
    render(<InnovationTalos />);

    expect(screen.getByTestId('navigation')).toBeDefined();
    expect(screen.getByText('Back to Home')).toBeDefined();
  });

  it('starts work cell when button clicked', () => {
    render(<InnovationTalos />);

    const button = screen.getByTestId('gold-button');
    expect(button).toHaveProperty('disabled', false);

    fireEvent.click(button);

    // Button should be disabled while running
    expect(button).toHaveProperty('disabled', true);
    // Cycle counter should appear
    expect(screen.getByText(/Cycle/)).toBeDefined();
  });
});
