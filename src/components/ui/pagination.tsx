'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export const Pagination = React.memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = false,
  maxVisiblePages = 5,
  className = ''
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: number[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Se o total de páginas é menor que o máximo visível, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com base na página atual
      if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
        // Início: mostra as primeiras páginas
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
        // Final: mostra as últimas páginas
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: mostra páginas ao redor da atual
        const start = currentPage - Math.floor(maxVisiblePages / 2);
        for (let i = start; i < start + maxVisiblePages; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showLeftEllipsis = visiblePages.length > 0 && visiblePages[0]! > 1;
  const showRightEllipsis = visiblePages.length > 0 && visiblePages[visiblePages.length - 1]! < totalPages;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Botão Primeira Página */}
      {showFirstLast && currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          className="hidden sm:flex"
        >
          Primeira
        </Button>
      )}

      {/* Botão Anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      {/* Primeira página + ellipsis */}
      {showLeftEllipsis && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          <span className="px-2 text-brown-500">...</span>
        </>
      )}

      {/* Páginas visíveis */}
      <div className="flex gap-1">
        {visiblePages.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            className={currentPage === pageNumber ? 'bg-rose-500 hover:bg-rose-600' : ''}
          >
            {pageNumber}
          </Button>
        ))}
      </div>

      {/* Última página + ellipsis */}
      {showRightEllipsis && (
        <>
          <span className="px-2 text-brown-500">...</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Botão Próxima */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Próxima</span>
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Botão Última Página */}
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="hidden sm:flex"
        >
          Última
        </Button>
      )}
    </div>
  );
});

// Componente adicional para informações de paginação
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = ''
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`text-sm text-brown-600 ${className}`}>
      Mostrando {startItem} a {endItem} de {totalItems} resultado{totalItems !== 1 ? 's' : ''}
      {totalPages > 1 && (
        <span className="ml-2">
          (Página {currentPage} de {totalPages})
        </span>
      )}
    </div>
  );
}