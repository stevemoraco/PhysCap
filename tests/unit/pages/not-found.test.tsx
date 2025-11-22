import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFound from '@/pages/not-found';

describe('NotFound', () => {
  it('renders 404 message', () => {
    render(<NotFound />);

    expect(screen.getByText('404 Page Not Found')).toBeDefined();
  });

  it('displays helper text about router', () => {
    render(<NotFound />);

    expect(screen.getByText(/Did you forget to add the page to the router?/)).toBeDefined();
  });

  it('renders alert icon', () => {
    const { container } = render(<NotFound />);

    // Check for lucide-react AlertCircle icon
    const icon = container.querySelector('svg');
    expect(icon).toBeDefined();
  });

  it('uses card layout', () => {
    const { container } = render(<NotFound />);

    // Check for centered container
    const centerContainer = container.querySelector('.min-h-screen.flex.items-center.justify-center');
    expect(centerContainer).toBeDefined();
  });
});
