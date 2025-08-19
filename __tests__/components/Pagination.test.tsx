import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  describe('Basic Pagination', () => {
    it('renders pagination buttons correctly', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Anterior')).toBeInTheDocument();
      expect(screen.getByText('Próxima')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );

    const prevButton = screen.getByRole('button', { name: /anterior/i });
    expect(prevButton).toBeDisabled();
  });

    it('disables next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
    );

    const nextButton = screen.getByRole('button', { name: /próxima/i });
    expect(nextButton).toBeDisabled();
  });

    it('calls onPageChange when clicking page numbers', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      fireEvent.click(screen.getByText('2'));
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when clicking next button', () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      fireEvent.click(screen.getByText('Próxima'));
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange when clicking previous button', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      fireEvent.click(screen.getByText('Anterior'));
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Ellipsis Display', () => {
    it('shows ellipsis for large page counts', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={20}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getAllByText('...')).toHaveLength(2);
    });

    it('shows first and last pages with ellipsis', () => {
      render(
        <Pagination
          currentPage={10}
          totalPages={20}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getAllByText('...')).toHaveLength(2);
    });
  });

  describe('First/Last Buttons', () => {
    it('shows first/last buttons when enabled', () => {
      render(
        <Pagination
          currentPage={10}
          totalPages={20}
          onPageChange={mockOnPageChange}
          showFirstLast={true}
        />
      );

      expect(screen.getByText('Primeira')).toBeInTheDocument();
      expect(screen.getByText('Última')).toBeInTheDocument();
    });

    it('calls onPageChange when clicking first/last buttons', () => {
      render(
        <Pagination
          currentPage={10}
          totalPages={20}
          onPageChange={mockOnPageChange}
          showFirstLast={true}
        />
      );

      fireEvent.click(screen.getByText('Primeira'));
      expect(mockOnPageChange).toHaveBeenCalledWith(1);

      fireEvent.click(screen.getByText('Última'));
      expect(mockOnPageChange).toHaveBeenCalledWith(20);
    });
  });

  describe('Single Page', () => {
    it('does not render when totalPages is 1', () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={1}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});

describe('PaginationInfo Component', () => {
  it('renders pagination information correctly', () => {
    render(
      <PaginationInfo
        currentPage={2}
        totalPages={5}
        itemsPerPage={10}
        totalItems={45}
      />
    );

    expect(screen.getByText(/Mostrando 11 a 20 de 45 resultados/)).toBeInTheDocument();
    expect(screen.getByText(/Página 2 de 5/)).toBeInTheDocument();
  });

  it('handles first page correctly', () => {
    render(
      <PaginationInfo
        currentPage={1}
        totalPages={3}
        itemsPerPage={10}
        totalItems={25}
      />
    );

    expect(screen.getByText(/Mostrando 1 a 10 de 25 resultados/)).toBeInTheDocument();
  });

  it('handles last page with fewer items', () => {
    render(
      <PaginationInfo
        currentPage={3}
        totalPages={3}
        itemsPerPage={10}
        totalItems={25}
      />
    );

    expect(screen.getByText(/Mostrando 21 a 25 de 25 resultados/)).toBeInTheDocument();
  });

  it('handles single item correctly', () => {
    render(
      <PaginationInfo
        currentPage={1}
        totalPages={1}
        itemsPerPage={10}
        totalItems={1}
      />
    );

    expect(screen.getByText(/Mostrando 1 a 1 de 1 resultado/)).toBeInTheDocument();
  });

  it('handles zero items', () => {
    const { container } = render(
      <PaginationInfo
        currentPage={1}
        totalPages={1}
        itemsPerPage={10}
        totalItems={0}
      />
    );

    expect(container.textContent).toContain('Mostrando 1 a 0 de 0 resultados');
  });
});