import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Landing from '@/pages/Landing';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useInteractionTracking', () => ({
  useInteractionTracking: vi.fn(),
}));

// Mock child components
vi.mock('@/components/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

vi.mock('@/components/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero">Hero Section</div>,
}));

vi.mock('@/components/ProjectTavakiev', () => ({
  ProjectTavakiev: () => <div data-testid="tavakiev">Project Tavakiev</div>,
}));

vi.mock('@/components/ProjectShowcase', () => ({
  ProjectShowcase: () => <div data-testid="showcase">Project Showcase</div>,
}));

vi.mock('@/components/InnovationsSection', () => ({
  InnovationsSection: () => <div data-testid="innovations">Innovations</div>,
}));

vi.mock('@/components/GoldButton', () => ({
  GoldButton: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="gold-button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/GyroscopePermission', () => ({
  GyroscopePermission: ({ onPermissionGranted }: any) => (
    <div data-testid="gyro-permission">Gyroscope Permission</div>
  ),
}));

vi.mock('@/components/SEOHead', () => ({
  SEOHead: () => <div data-testid="seo-head">SEO Head</div>,
}));

import { useAuth } from '@/hooks/useAuth';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';

describe('Landing', () => {
  const mockTrackPageVisit = vi.fn(() => vi.fn());
  const mockTrackCTA = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    vi.mocked(useInteractionTracking).mockReturnValue({
      trackPageVisit: mockTrackPageVisit,
      trackCTA: mockTrackCTA,
      trackInteraction: vi.fn(),
    });
  });

  it('renders landing page with all sections', () => {
    render(<Landing />);

    expect(screen.getByTestId('seo-head')).toBeDefined();
    expect(screen.getByTestId('navigation')).toBeDefined();
    expect(screen.getByTestId('hero')).toBeDefined();
    expect(screen.getByTestId('tavakiev')).toBeDefined();
    expect(screen.getByTestId('showcase')).toBeDefined();
    expect(screen.getByTestId('innovations')).toBeDefined();
    expect(screen.getByTestId('gyro-permission')).toBeDefined();
  });

  it('displays featured project section', () => {
    render(<Landing />);

    expect(screen.getByText('Featured')).toBeDefined();
    expect(screen.getByText(/Leading the American solar renaissance/)).toBeDefined();
    expect(screen.getByTestId('tavakiev')).toBeDefined();
  });

  it('displays additional ventures section', () => {
    render(<Landing />);

    expect(screen.getByText(/Additional/)).toBeDefined();
    expect(screen.getByText(/Ventures/)).toBeDefined();
    expect(screen.getByTestId('showcase')).toBeDefined();
  });

  it('displays final CTA section', () => {
    render(<Landing />);

    expect(screen.getByText(/Ready to Build the Future?/)).toBeDefined();
    expect(screen.getByText(/Get Started Today/)).toBeDefined();
  });

  it('displays footer with copyright', () => {
    render(<Landing />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeDefined();
    expect(screen.getByText(/Physical.Capital/)).toBeDefined();
  });

  it('tracks page visit when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 123, username: 'testuser' },
      isLoading: false,
      isAuthenticated: true,
    });

    render(<Landing />);

    expect(mockTrackPageVisit).toHaveBeenCalledWith('/');
  });

  it('does not track page visit when user is not logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(<Landing />);

    // trackPageVisit should not be called without user
    // Note: The effect still runs but returns early
    expect(mockTrackPageVisit).not.toHaveBeenCalled();
  });

  it('renders CTA button with click handler', () => {
    render(<Landing />);

    const button = screen.getByTestId('gold-button');
    expect(button).toBeDefined();
    expect(button.textContent).toBe('Get Started Today');
  });

  it('renders golden particle decorations', () => {
    const { container } = render(<Landing />);

    // Check for decorative particles (there should be 20)
    const particles = container.querySelectorAll('.bg-primary.rounded-full');
    expect(particles.length).toBe(20);
  });
});
