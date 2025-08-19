'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    // Só executar no cliente e em produção ou desenvolvimento com flag
    if (typeof window !== 'undefined') {
      reportWebVitals();
    }
  }, []);

  // Componente não renderiza nada
  return null;
}