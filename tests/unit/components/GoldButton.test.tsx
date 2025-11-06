import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GoldButton } from '@/components/GoldButton';

describe('GoldButton', () => {
  it('renders with children text', () => {
    render(<GoldButton>Click Me</GoldButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<GoldButton onClick={handleClick}>Click Me</GoldButton>);

    const button = screen.getByText('Click Me');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with arrow icon by default', () => {
    render(<GoldButton>Test</GoldButton>);
    const button = screen.getByTestId('button-cta-primary');
    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with sparkle icon when specified', () => {
    render(<GoldButton icon="sparkle">Test</GoldButton>);
    const button = screen.getByTestId('button-cta-primary');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders without icon when icon is "none"', () => {
    render(<GoldButton icon="none">Test</GoldButton>);
    const button = screen.getByTestId('button-cta-primary');
    expect(button.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders outline variant', () => {
    render(<GoldButton variant="outline">Test</GoldButton>);
    const button = screen.getByTestId('button-cta-outline');
    expect(button).toBeInTheDocument();
  });

  it('renders primary variant by default', () => {
    render(<GoldButton>Test</GoldButton>);
    const button = screen.getByTestId('button-cta-primary');
    expect(button).toBeInTheDocument();
  });

  it('can be disabled', () => {
    const handleClick = vi.fn();
    render(
      <GoldButton onClick={handleClick} disabled>
        Test
      </GoldButton>
    );

    const button = screen.getByTestId('button-cta-primary');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<GoldButton className="custom-class">Test</GoldButton>);
    const button = screen.getByTestId('button-cta-primary');
    expect(button).toHaveClass('custom-class');
  });

  it('accepts custom data-testid', () => {
    render(<GoldButton data-testid="custom-button">Test</GoldButton>);
    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
  });

  it('renders large size variant', () => {
    render(<GoldButton size="lg">Test</GoldButton>);
    const button = screen.getByTestId('button-cta-primary');
    expect(button).toBeInTheDocument();
  });
});
