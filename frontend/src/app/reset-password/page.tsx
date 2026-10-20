'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Token no proporcionado o enlace inválido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ token, new_password: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al actualizar la contraseña.');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'No fue posible conectar con el servidor. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#111A28] border border-[#24334A] rounded-2xl p-8 shadow-2xl relative">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Nueva Contraseña</h2>
        <p className="text-xs text-slate-400 mt-1">Crea una nueva contraseña segura para tu cuenta</p>
      </div>

      {error && (
        <div className="mb-4 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl leading-relaxed">
          {error}
        </div>
      )}

      {success ? (
        <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h3 className="text-sm font-bold text-white">¡Contraseña Actualizada!</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tu contraseña ha sido restablecida exitosamente. Ahora puedes ingresar con tus nuevas credenciales.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Ir a Iniciar Sesión →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-sky-950/40 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? 'Actualizando...' : 'Guardar Nueva Contraseña →'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#070B11] flex flex-col items-center justify-center p-4">
      {/* Brand Header con Emblema Dorado */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0E1A2C] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg shadow-amber-950/20 mb-3">
          <span className="text-2xl font-black text-[#F3C969] font-serif">M</span>
        </div>
        <h1 className="text-xl font-black tracking-tight text-white">SetterMind AI</h1>
        <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
          Restablecimiento Seguro
        </p>
      </div>

      <Suspense fallback={<div className="text-xs text-slate-400">Cargando formulario...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
