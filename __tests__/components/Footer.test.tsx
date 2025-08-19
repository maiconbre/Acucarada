import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/public/Footer';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_WHATSAPP_NUMBER: '5511999999999'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Footer Component', () => {
  it('renders the company logo and name', () => {
    render(<Footer />);
    
    expect(screen.getByText('Açucarada')).toBeInTheDocument();
  });

  it('renders company description', () => {
    render(<Footer />);
    
    expect(screen.getByText(/Doces artesanais feitos com amor/)).toBeInTheDocument();
  });

  it('renders quick links section', () => {
    render(<Footer />);
    
    expect(screen.getByText('Links Rápidos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/catalogo');
    expect(screen.getByRole('link', { name: 'Sobre Nós' })).toHaveAttribute('href', '/sobre');
  });

  it('renders contact information', () => {
    render(<Footer />);

    expect(screen.getByText('Contato')).toBeInTheDocument();
    expect(screen.getByText(/Centro, São Paulo - SP/)).toBeInTheDocument();
    
    const allLinks = screen.getAllByRole('link');
    const phoneLink = allLinks.find(link => link.getAttribute('href')?.startsWith('tel:'));
    const emailLink = allLinks.find(link => link.getAttribute('href')?.startsWith('mailto:'));
    
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute('href', 'tel:+5511999999999');
    
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:contato@acucarada.com.br');
  });

  it('renders business hours section', () => {
    render(<Footer />);
    
    expect(screen.getByText('Horário de Funcionamento')).toBeInTheDocument();
    expect(screen.getByText(/Segunda a Sexta/)).toBeInTheDocument();
    expect(screen.getByText(/Sábado/)).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    
    const socialLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.includes('instagram.com') || 
      link.getAttribute('href')?.includes('facebook.com')
    );
    
    expect(socialLinks).toHaveLength(2);
    expect(socialLinks[0]).toHaveAttribute('href', 'https://instagram.com/acucarada');
    expect(socialLinks[1]).toHaveAttribute('href', 'https://facebook.com/acucarada');
    expect(socialLinks[0]).toHaveAttribute('target', '_blank');
    expect(socialLinks[1]).toHaveAttribute('target', '_blank');
  });

  it('renders WhatsApp link with correct phone number', () => {
    render(<Footer />);
    
    const whatsappLink = screen.getByRole('link', { name: 'Fazer Pedido' });
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('wa.me/5511999999999'));
    expect(whatsappLink).toHaveAttribute('target', '_blank');
  });

  it('renders current year in copyright', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('renders privacy policy and terms links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', '/politica-privacidade');
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/termos-uso');
  });

  it('has proper accessibility attributes for external links', () => {
    render(<Footer />);
    
    const socialLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.includes('instagram.com') || 
      link.getAttribute('href')?.includes('facebook.com')
    );
    
    socialLinks.forEach(link => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});