'use client';

import Link from 'next/link';
import { memo } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = memo(function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 border-t border-rose-100">
      <div className="flex flex-col space-y-4">
        <Link 
          href="/" 
          className="text-brown-700 hover:text-rose-500 transition-colors font-medium px-4 py-2 hover:bg-rose-50 rounded-md"
          onClick={onClose}
        >
          Início
        </Link>
        <Link 
          href="/catalogo" 
          className="text-brown-700 hover:text-rose-500 transition-colors font-medium px-4 py-2 hover:bg-rose-50 rounded-md"
          onClick={onClose}
        >
          Catálogo
        </Link>
        <Link 
          href="/sobre" 
          className="text-brown-700 hover:text-rose-500 transition-colors font-medium px-4 py-2 hover:bg-rose-50 rounded-md"
          onClick={onClose}
        >
          Sobre
        </Link>
        <Link 
          href="/contato" 
          className="text-brown-700 hover:text-rose-500 transition-colors font-medium px-4 py-2 hover:bg-rose-50 rounded-md"
          onClick={onClose}
        >
          Contato
        </Link>
        <Link 
          href="/admin/login" 
          className="text-brown-500 hover:text-rose-500 transition-colors text-sm opacity-75 px-4 py-2 hover:bg-rose-50 rounded-md"
          onClick={onClose}
        >
          Admin
        </Link>
        <a
          href="https://wa.me/5511999999999?text=Olá%20Açucarada!%20Gostaria%20de%20fazer%20um%20pedido."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-rose-400 to-rose-500 text-white px-6 py-3 rounded-full hover:from-rose-500 hover:to-rose-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl mx-4 text-center"
          onClick={onClose}
        >
          Fazer Pedido
        </a>
      </div>
    </div>
  );
});