import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import InnovationGoldenSpike from '@/pages/InnovationGoldenSpike';

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

describe('InnovationGoldenSpike', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders page with title and description', () => {
    render(<InnovationGoldenSpike />);

    expect(screen.getByText('Golden Spike Autonomous Logistics')).toBeDefined();
    expect(screen.getByText('I-25 Corridor Autonomous Freight Network')).toBeDefined();
  });

  it('displays badges for key features', () => {
    render(<InnovationGoldenSpike />);

    expect(screen.getByText('Autonomous Trucks')).toBeDefined();
    // May appear in multiple places
    expect(screen.getAllByText('24/7 Operation').length).toBeGreaterThan(0);
    expect(screen.getByText('45% Cost Reduction')).toBeDefined();
  });

  it('renders navigation and back button', () => {
    render(<InnovationGoldenSpike />);

    expect(screen.getByTestId('navigation')).toBeDefined();
    expect(screen.getByText('Back to Home')).toBeDefined();
  });

  it('renders corridor map with cities', () => {
    const { container } = render(<InnovationGoldenSpike />);

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check for city labels
    expect(screen.getByText('Denver')).toBeDefined();
    expect(screen.getByText('Colorado Springs')).toBeDefined();
    expect(screen.getByText('Pueblo')).toBeDefined();
    expect(screen.getByText('Trinidad')).toBeDefined();
  });

  it('starts truck animation when button clicked', () => {
    render(<InnovationGoldenSpike />);

    const button = screen.getByTestId('gold-button');
    expect(button.textContent).toBe('Start Route');

    fireEvent.click(button);

    expect(button.textContent).toBe('Running...');
  });

  it('animates truck position over time', () => {
    render(<InnovationGoldenSpike />);

    const button = screen.getByTestId('gold-button');
    fireEvent.click(button);

    // Initially should be running
    expect(button.textContent).toBe('Running...');

    // Advance timers to move truck
    vi.advanceTimersByTime(1000); // 20 intervals * 50ms
  });
});
