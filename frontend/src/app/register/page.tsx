'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser } from '@/lib/api';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyParam = searchParams.get('key') || '';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (keyParam) {
      setApiKey(keyParam);
    }
  }, [keyParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!apiKey.trim()) {
      setError('Se requiere una clave de licencia (API Key) válida adquirida en Hotmart.');
      setIsLoading(false);
      return;
    }

    try {
      await registerUser({
        username,
        email,
        password,
        api_key: apiKey.trim(),
      } as any);

      alert('¡Cuenta activada con éxito! Ahora puedes iniciar sesión.');
      router.push('/login');
    } catch (err: any) {
      setError(err?.message || 'Error al procesar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-4xl font-bold text-center mb-4">Crea tu Cuenta</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm mb-1 font-medium text-gray-300">
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm mb-1 font-medium text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm mb-1 font-medium text-gray-300">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="apiKey" className="block text-sm mb-1 font-medium text-gray-300">
            Clave de Licencia (API Key SaaS)
          </label>
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            placeholder="sm_xxxxxxxx..."
            className="bg-gray-700 border border-gray-600 text-cyan-400 font-mono text-sm rounded-lg block w-full p-2.5 outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Esta clave se genera automáticamente tras tu compra en Hotmart.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Registrando...' : 'Activar Cuenta'}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-8">
      <Suspense fallback={<p className="text-gray-400">Cargando formulario...</p>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
