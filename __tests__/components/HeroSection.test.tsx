import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/public/HeroSection';

describe('HeroSection Component', () => {
  it('renders the main heading', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Doces que')).toBeInTheDocument();
    expect(screen.getByText('encantam')).toBeInTheDocument();
    expect(screen.getByText('o coração')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<HeroSection />);
    
    expect(screen.getByText(/Criamos doces artesanais únicos/)).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    render(<HeroSection />);
    
    const catalogButton = screen.getByRole('link', { name: /ver catálogo/i });
    const whatsappButton = screen.getByRole('link', { name: /falar no whatsapp/i });
    
    expect(catalogButton).toBeInTheDocument();
    expect(whatsappButton).toBeInTheDocument();
  });

  it('has correct button links', () => {
    render(<HeroSection />);
    
    const catalogButton = screen.getByRole('link', { name: /ver catálogo/i });
    const whatsappButton = screen.getByRole('link', { name: /falar no whatsapp/i });
    
    expect(catalogButton).toHaveAttribute('href', '/catalogo');
    expect(whatsappButton).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });

  it('renders hero visual elements', () => {
    render(<HeroSection />);
    
    // Check for the visual text elements
    expect(screen.getByText('Doces Artesanais')).toBeInTheDocument();
    expect(screen.getByText('Feitos com Amor')).toBeInTheDocument();
  });

  it('has proper responsive layout classes', () => {
    const { container } = render(<HeroSection />);
    
    const heroSection = container.firstChild;
    expect(heroSection).toHaveClass('relative', 'overflow-hidden', 'bg-gradient-to-br');
  });
});