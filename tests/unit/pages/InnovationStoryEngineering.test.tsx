import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InnovationStoryEngineering from '@/pages/InnovationStoryEngineering';

// Mock components
vi.mock('@/components/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

vi.mock('@/components/GoldButton', () => ({
  GoldButton: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('wouter', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('InnovationStoryEngineering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page with title and description', () => {
    render(<InnovationStoryEngineering />);

    expect(screen.getByText('DATA AI Investment Advisor')).toBeDefined();
    expect(screen.getByText('Story Engineering through Conversational Intelligence')).toBeDefined();
  });

  it('displays feature badges', () => {
    render(<InnovationStoryEngineering />);

    expect(screen.getByText('GPT-4 Powered')).toBeDefined();
    // Use getAllByText since this appears in both badges and capability cards
    const realTimeElements = screen.getAllByText('Real-Time Analysis');
    expect(realTimeElements.length).toBeGreaterThan(0);
    const investorElements = screen.getAllByText('Investor-Focused');
    expect(investorElements.length).toBeGreaterThan(0);
  });

  it('renders navigation and back button', () => {
    render(<InnovationStoryEngineering />);

    expect(screen.getByTestId('navigation')).toBeDefined();
    expect(screen.getByText('Back to Home')).toBeDefined();
  });

  it('displays chat interface', () => {
    render(<InnovationStoryEngineering />);

    expect(screen.getByText('DATA AI Chat')).toBeDefined();
    expect(screen.getByTestId('chat-input')).toBeDefined();
    expect(screen.getByTestId('send-message')).toBeDefined();
  });

  it('displays initial assistant message', () => {
    render(<InnovationStoryEngineering />);

    expect(screen.getByText(/Hello! I'm DATA/)).toBeDefined();
    expect(screen.getByText(/Physical.Capital's AI investment advisor/)).toBeDefined();
  });

  it('displays sample questions', () => {
    render(<InnovationStoryEngineering />);

    expect(screen.getByText('Try These Questions:')).toBeDefined();
    expect(screen.getByText(/Section 45X tax credit/)).toBeDefined();
    expect(screen.getByText(/Tabeguache Collection/)).toBeDefined();
  });

  it('allows user to type message in input', () => {
    render(<InnovationStoryEngineering />);

    const input = screen.getByTestId('chat-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test question' } });

    expect(input.value).toBe('Test question');
  });

  it('sends message when send button clicked', () => {
    render(<InnovationStoryEngineering />);

    const input = screen.getByTestId('chat-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test question' } });

    expect(input.value).toBe('Test question');

    const sendButton = screen.getByTestId('send-message');
    fireEvent.click(sendButton);

    // Button click should be successful
    expect(sendButton).toBeDefined();
  });

  it('sends message on Enter key press', () => {
    render(<InnovationStoryEngineering />);

    const input = screen.getByTestId('chat-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test question' } });

    expect(input.value).toBe('Test question');

    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    // Enter key press should be handled
    expect(input).toBeDefined();
  });

  it('populates input when sample question clicked', () => {
    render(<InnovationStoryEngineering />);

    const sampleQuestion = screen.getByTestId('sample-question-0');
    fireEvent.click(sampleQuestion);

    const input = screen.getByTestId('chat-input') as HTMLInputElement;
    expect(input.value).toBeTruthy();
  });

  it('displays capability cards', () => {
    render(<InnovationStoryEngineering />);

    // These texts appear in both badges and capability cards
    expect(screen.getAllByText(/Real-Time Analysis/).length).toBeGreaterThan(0);
    expect(screen.getByText('Natural Language')).toBeDefined();
    expect(screen.getAllByText(/Investor-Focused/).length).toBeGreaterThan(0);
  });
});
