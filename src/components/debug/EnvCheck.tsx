'use client';

import { useEffect, useState } from 'react';

interface EnvStatus {
  NEXT_PUBLIC_SUPABASE_URL: boolean;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: boolean;
  NEXT_PUBLIC_WHATSAPP_NUMBER: boolean;
  NEXT_PUBLIC_SITE_URL: boolean;
}

export default function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === 'production');
    
    setEnvStatus({
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_WHATSAPP_NUMBER: !!process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    });
  }, []);

  if (!envStatus) return null;

  // Só mostrar em desenvolvimento ou se houver problemas
  const hasIssues = Object.values(envStatus).some(status => !status);
  if (isProduction && !hasIssues) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-sm">
      <h4 className="font-bold mb-2">Environment Check</h4>
      <div className="text-sm space-y-1">
        <div>Environment: {isProduction ? 'Production' : 'Development'}</div>
        {Object.entries(envStatus).map(([key, value]) => (
          <div key={key} className={value ? 'text-green-600' : 'text-red-600'}>
            {key}: {value ? '✓' : '✗'}
          </div>
        ))}
      </div>
    </div>
  );
}