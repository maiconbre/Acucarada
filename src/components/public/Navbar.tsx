'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🧁</span>
            </div>
            <span className="text-2xl font-bold text-brown-800" style={{ fontFamily: 'Dancing Script, cursive' }}>
              Açucarada
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-brown-700 hover:text-rose-500 transition-colors font-medium"
              prefetch={true}
            >
              Início
            </Link>
            <Link 
              href="/catalogo" 
              className="text-brown-700 hover:text-rose-500 transition-colors font-medium"
              prefetch={true}
            >
              Catálogo
            </Link>
            <Link 
              href="/sobre" 
              className="text-brown-700 hover:text-rose-500 transition-colors font-medium"
              prefetch={false}
            >
              Sobre
            </Link>
            <Link 
              href="/contato" 
              className="text-brown-700 hover:text-rose-500 transition-colors font-medium"
              prefetch={false}
            >
              Contato
            </Link>
            <Link 
              href="/admin/login" 
              className="text-brown-500 hover:text-rose-500 transition-colors text-sm opacity-75"
              prefetch={false}
            >
              Admin
            </Link>
            <a
              href="https://wa.me/5511999999999?text=Olá%20Açucarada!%20Gostaria%20de%20fazer%20um%20pedido."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-rose-400 to-rose-500 text-white px-6 py-2 rounded-full hover:from-rose-500 hover:to-rose-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Fazer Pedido
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-brown-700 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    </nav>
  );
}