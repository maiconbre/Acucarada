'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/95 backdrop-blur-sm border-t border-rose-100 text-brown-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <h3 className="text-2xl font-bold text-brown-800" style={{ fontFamily: 'Dancing Script, cursive' }}>
                Açucarada
              </h3>
            </div>
            <p className="text-brown-600 leading-relaxed">
              Doces artesanais feitos com amor e ingredientes selecionados. 
              Transformando momentos especiais em memórias ainda mais doces.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/acucarada" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors text-rose-600"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/acucarada" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors text-rose-600"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-rose-600">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-brown-600 hover:text-rose-500 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-brown-600 hover:text-rose-500 transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-brown-600 hover:text-rose-500 transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}?text=Olá! Gostaria de fazer um pedido.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brown-600 hover:text-rose-500 transition-colors"
                >
                  Fazer Pedido
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="text-brown-500 hover:text-rose-500 transition-colors text-sm opacity-75">
                  Área Administrativa
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-rose-600">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <span className="text-brown-600">
                  Rua das Delícias, 123<br />
                  Centro, São Paulo - SP<br />
                  CEP: 01234-567
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <a 
                  href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}`}
                  className="text-brown-600 hover:text-rose-500 transition-colors"
                >
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <a 
                  href="mailto:contato@acucarada.com.br"
                  className="text-brown-600 hover:text-rose-500 transition-colors"
                >
                  contato@acucarada.com.br
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-rose-600">Horário de Funcionamento</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <div className="text-brown-600">
                  <div className="font-medium">Segunda a Sexta</div>
                  <div className="text-sm">08:00 - 18:00</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <div className="text-brown-600">
                  <div className="font-medium">Sábado</div>
                  <div className="text-sm">08:00 - 16:00</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <div className="text-brown-600">
                  <div className="font-medium">Domingo</div>
                  <div className="text-sm">Fechado</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-sm text-brown-600">
                <strong className="text-rose-600">Encomendas:</strong> Faça seu pedido com 24h de antecedência
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-rose-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-brown-500 text-sm">
              © {currentYear} Açucarada. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/politica-privacidade" className="text-brown-500 hover:text-rose-500 transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos-uso" className="text-brown-500 hover:text-rose-500 transition-colors">
                Termos de Uso
              </Link>
              <div className="text-brown-500">
                Feito com <Heart className="w-4 h-4 inline text-rose-500 fill-rose-500" /> por Açucarada
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}