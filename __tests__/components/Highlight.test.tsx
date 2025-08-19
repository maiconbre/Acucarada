import { render, screen } from '@testing-library/react';
import { Highlight } from '@/components/ui/highlight';

describe('Highlight Component', () => {
  it('renders text without highlighting when no search term', () => {
    render(<Highlight text="Hello World" searchTerm="" />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
  });

  it('highlights single word match', () => {
    render(<Highlight text="Hello World" searchTerm="Hello" />);
    
    const highlightedText = screen.getByText('Hello');
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText.tagName).toBe('MARK');
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('highlights multiple matches case-insensitively', () => {
    render(<Highlight text="Hello hello HELLO" searchTerm="hello" />);
    
    const highlights = screen.getAllByText(/hello/i);
    expect(highlights).toHaveLength(3);
    highlights.forEach(highlight => {
      expect(highlight.tagName).toBe('MARK');
    });
  });

  it('highlights partial matches correctly', () => {
    const { container } = render(<Highlight text="JavaScript is awesome" searchTerm="Script" />);
    
    expect(container.textContent).toBe('JavaScript is awesome');
    
    const markElements = container.querySelectorAll('mark');
    expect(markElements.length).toBeGreaterThan(0);
    expect(markElements[0].textContent).toBe('Script');
  });

  it('handles special regex characters in search term', () => {
    render(<Highlight text="Price: $10.99" searchTerm="$10.99" />);
    
    const highlightedText = screen.getByText('$10.99');
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText.tagName).toBe('MARK');
  });

  it('handles empty text', () => {
    render(<Highlight text="" searchTerm="test" />);
    
    expect(screen.queryByText('test')).not.toBeInTheDocument();
  });

  it('handles whitespace-only search term', () => {
    render(<Highlight text="Hello World" searchTerm="   " />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Highlight 
        text="Hello World" 
        searchTerm="Hello" 
        className="custom-highlight"
      />
    );
    
    const container = screen.getByText('Hello').closest('span');
    expect(container).toHaveClass('custom-highlight');
  });

  it('highlights multiple separate words', () => {
    const { container } = render(<Highlight text="The quick brown fox" searchTerm="quick fox" />);
    
    expect(container.textContent).toBe('The quick brown fox');
    
    const markElements = container.querySelectorAll('mark');
    expect(markElements.length).toBeGreaterThan(0);
  });

  it('handles overlapping matches correctly', () => {
    render(<Highlight text="ababab" searchTerm="abab" />);
    
    const highlights = screen.getAllByText(/abab/);
    expect(highlights.length).toBeGreaterThan(0);
  });

  it('preserves text structure with multiple highlights', () => {
    const { container } = render(<Highlight text="React is a JavaScript library" searchTerm="React JavaScript" />);
    
    expect(container.textContent).toBe('React is a JavaScript library');
    
    const markElements = container.querySelectorAll('mark');
    expect(markElements.length).toBeGreaterThan(0);
  });

  it('handles unicode characters', () => {
    const { container } = render(<Highlight text="Açúcar é doce" searchTerm="Açúcar" />);
    
    expect(container.textContent).toBe('Açúcar é doce');
    
    const markElements = container.querySelectorAll('mark');
    expect(markElements.length).toBeGreaterThan(0);
  });

  it('handles numbers and special characters', () => {
    render(<Highlight text="Product #123 costs $29.99" searchTerm="#123" />);
    
    const highlightedText = screen.getByText('#123');
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText.tagName).toBe('MARK');
  });
});