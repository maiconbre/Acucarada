import { createClient } from '@/lib/supabase/server';

export default async function DebugPage() {
  let supabaseStatus = 'Unknown';
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_WHATSAPP_NUMBER: !!process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    NODE_ENV: process.env.NODE_ENV,
  };
  let error: any = null;
  let testQuery = null;

  try {
    const supabase = createClient();
    
    // Teste simples de conectividade
    const { data, error: queryError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (queryError) {
      error = queryError;
      supabaseStatus = 'Error';
    } else {
      supabaseStatus = 'Connected';
      testQuery = data;
    }
  } catch (err) {
    error = err;
    supabaseStatus = 'Failed to connect';
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="grid gap-6">
          {/* Environment Variables */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-mono">{key}:</span>
                  <span className={`font-mono ${
                    typeof value === 'boolean' 
                      ? (value ? 'text-green-600' : 'text-red-600')
                      : 'text-blue-600'
                  }`}>
                    {typeof value === 'boolean' ? (value ? '✓ Set' : '✗ Missing') : value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Supabase Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Supabase Connection</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-semibold ${
                  supabaseStatus === 'Connected' ? 'text-green-600' :
                  supabaseStatus === 'Error' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {supabaseStatus}
                </span>
              </div>
              
              {testQuery && (
                <div className="mt-4">
                  <h3 className="font-semibold">Test Query Result:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(testQuery, null, 2)}
                  </pre>
                </div>
              )}
              
              {error && (
                <div className="mt-4">
                  <h3 className="font-semibold text-red-600">Error Details:</h3>
                  <pre className="bg-red-50 p-2 rounded text-sm overflow-auto text-red-800">
                    {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">System Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="font-mono">{new Date().toISOString()}</span>
              </div>
              <div className="flex justify-between">
                <span>User Agent:</span>
                <span className="font-mono text-sm break-all">
                  {typeof window !== 'undefined' ? navigator.userAgent : 'Server-side'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}