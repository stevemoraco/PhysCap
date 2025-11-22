import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InnovationVitruvius from '@/pages/InnovationVitruvius';

// Mock components
vi.mock('@/components/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

vi.mock('@/components/GoldButton', () => ({
  GoldButton: ({ children }: any) => (
    <button data-testid="gold-button">{children}</button>
  ),
}));

vi.mock('wouter', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('InnovationVitruvius', () => {
  it('renders page with title and description', () => {
    render(<InnovationVitruvius />);

    expect(screen.getByText('Vitruvius Pre-Fab Construction')).toBeDefined();
  });

  it('displays badges for key features', () => {
    render(<InnovationVitruvius />);

    expect(screen.getByText('6-Month Build Time')).toBeDefined();
    expect(screen.getByText('70% Cost Reduction')).toBeDefined();
    expect(screen.getByText('Factory Precision')).toBeDefined();
  });

  it('renders navigation and back button', () => {
    render(<InnovationVitruvius />);

    expect(screen.getByTestId('navigation')).toBeDefined();
    expect(screen.getByText('Back to Home')).toBeDefined();
  });

  it('displays construction benefits', () => {
    const { container } = render(<InnovationVitruvius />);

    // Page should have cards or content sections
    const cards = container.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThan(0);
  });
});
