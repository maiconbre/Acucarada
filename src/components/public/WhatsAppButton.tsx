'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

// Declaração de tipo para Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show button after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Show tooltip after button appears
      setTimeout(() => setShowTooltip(true), 1000);
      // Hide tooltip after 5 seconds
      setTimeout(() => setShowTooltip(false), 6000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999';
    const message = 'Olá Açucarada! Gostaria de fazer um pedido ou tirar uma dúvida.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // Track click event (you can implement analytics here)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: 'floating_button'
      });
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs relative">
              <button
                onClick={() => setShowTooltip(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">🧁</span>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Olá! Como posso ajudar?
                  </p>
                  <p className="text-xs text-gray-600">
                    Clique para fazer seu pedido via WhatsApp
                  </p>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          </div>
        )}
        
        {/* Main Button */}
        <button
          onClick={handleWhatsAppClick}
          className="group relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-bounce-slow"
          aria-label="Falar no WhatsApp"
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
          
          {/* Icon */}
          <MessageCircle className="w-7 h-7 text-white relative z-10 group-hover:scale-110 transition-transform" />
          
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        </button>
        
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse-ring opacity-60"></div>
        <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-pulse-ring-delayed opacity-40"></div>
      </div>
      
      {/* Custom styles */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes pulse-ring-delayed {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2s infinite;
        }
        
        .animate-pulse-ring-delayed {
          animation: pulse-ring-delayed 2s infinite 0.5s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}