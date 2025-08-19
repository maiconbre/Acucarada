'use client';

import { ArrowRight, Heart, Star } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-100 py-20 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-rose-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-brown-600 font-medium">Mais de 500 clientes satisfeitos</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brown-800 mb-6">
              <span className="block" style={{ fontFamily: 'Dancing Script, cursive' }}>
                Doces que
              </span>
              <span className="block text-rose-500" style={{ fontFamily: 'Dancing Script, cursive' }}>
                encantam
              </span>
              <span className="block text-brown-800">o coração</span>
            </h1>

            <p className="text-lg sm:text-xl text-brown-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Criamos doces artesanais únicos, feitos com amor e ingredientes selecionados. 
              Cada mordida é uma experiência inesquecível que desperta sorrisos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/catalogo"
                className="group bg-gradient-to-r from-rose-400 to-rose-500 text-white px-8 py-4 rounded-full hover:from-rose-500 hover:to-rose-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <a
                href="https://wa.me/5511999999999?text=Olá%20Açucarada!%20Gostaria%20de%20conhecer%20seus%20doces."
                target="_blank"
                rel="noopener noreferrer"
                className="group border-2 border-rose-400 text-rose-500 px-8 py-4 rounded-full hover:bg-rose-400 hover:text-white transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
              >
                <span>Falar no WhatsApp</span>
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-rose-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-rose-500 mb-1">50+</div>
                <div className="text-brown-600 text-sm sm:text-base">Tipos de Doces</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-rose-500 mb-1">500+</div>
                <div className="text-brown-600 text-sm sm:text-base">Clientes Felizes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-rose-500 mb-1">3</div>
                <div className="text-brown-600 text-sm sm:text-base">Anos de Tradição</div>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main image placeholder */}
              <div className="aspect-square bg-gradient-to-br from-rose-200 to-rose-300 rounded-3xl shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🧁</div>
                  <p className="text-brown-700 font-medium text-lg">Doces Artesanais</p>
                  <p className="text-brown-600">Feitos com Amor</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg animate-bounce">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg animate-pulse">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}