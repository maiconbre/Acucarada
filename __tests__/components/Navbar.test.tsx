import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/public/Navbar';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        })
      })
    })
  })
}));

describe('Navbar Component', () => {
  it('renders the logo and brand name', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Açucarada')).toBeInTheDocument();
    // O componente não tem "Doceria Artesanal", apenas o emoji e nome
    expect(screen.getByText('🧁')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Sobre')).toBeInTheDocument();
    expect(screen.getByText('Contato')).toBeInTheDocument();
  });

  it('renders mobile menu toggle button', () => {
    render(<Navbar />);
    
    // Buscar pelo botão que contém o ícone de menu
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('has correct link hrefs', () => {
    render(<Navbar />);
    
    const homeLink = screen.getByRole('link', { name: /início/i });
    const catalogLink = screen.getByRole('link', { name: /catálogo/i });
    const aboutLink = screen.getByRole('link', { name: /sobre/i });
    const contactLink = screen.getByRole('link', { name: /contato/i });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(catalogLink).toHaveAttribute('href', '/catalogo');
    expect(aboutLink).toHaveAttribute('href', '/sobre');
    expect(contactLink).toHaveAttribute('href', '/contato');
  });
});