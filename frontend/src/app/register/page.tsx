'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Error durante el registro. Verifica tu clave de licencia.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Branding SetterMind AI */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <img src="/Logo-Mentes-Mercado.png" alt="SetterMind AI" className="h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(234,179,8,0.2)]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">SetterMind AI</h1>
        <p className="text-xs uppercase tracking-widest font-semibold text-slate-400">Activación de Licencia</p>
      </div>

      {/* Tarjeta de Registro */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-[#24334A] pb-4 text-center">
          <h2 className="text-lg font-bold text-white">Crear Cuenta de Setter</h2>
          <p className="text-xs text-slate-400 mt-1">Ingresa tu clave de licencia Hotmart para habilitar tu acceso</p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 p-3 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Clave de Licencia (Hotmart)
            </label>
            <input
              type="text"
              id="apiKey"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="SM-XXXX-XXXX-XXXX"
              className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition font-mono"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre de Usuario o Alias
            </label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: setter_pro"
              className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{isLoading ? 'Activando cuenta...' : 'Activar Licencia e Iniciar →'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-[#24334A] text-center">
          <p className="text-xs text-slate-400">
            ¿Ya activaste tu cuenta?{' '}
            <Link href="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="bg-[#0B121E] text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <Suspense fallback={<div className="text-xs text-slate-400">Cargando formulario de activación...</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
