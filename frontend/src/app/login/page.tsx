'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('jwt_token', data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[#0B121E] text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Branding SetterMind AI */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src="/Logo-Mentes-Mercado.png" alt="SetterMind AI" className="h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(234,179,8,0.2)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SetterMind AI</h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-400">Mentes al Mercado</p>
        </div>

        {/* Tarjeta de Inicio de Sesión */}
        <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#24334A] pb-4 text-center">
            <h2 className="text-lg font-bold text-white">Bienvenido al Centro de Mando</h2>
            <p className="text-xs text-slate-400 mt-1">Ingresa con tus credenciales registradas</p>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 p-3 rounded-xl text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <span>{isLoading ? 'Iniciando Sesión...' : 'Entrar al Centro de Mando →'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#24334A] text-center">
            <p className="text-xs text-slate-400">
              ¿Tienes una clave de licencia nueva?{' '}
              <Link href="/register" className="font-semibold text-sky-400 hover:text-sky-300 transition">
                Activa tu cuenta aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
