'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Credenciales inválidas.');

      if (data.token) localStorage.setItem('jwt_token', data.token);
      if (data.user) {
        localStorage.setItem('user_info', JSON.stringify(data.user));
        localStorage.setItem('plan_tier', data.user.plan_tier || 'basic');
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Revisa tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsSendingReset(true);
    setResetMessage(null);
    setResetError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';
      const res = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al solicitar el enlace.');
      setResetMessage(data.message || 'Enlace enviado con éxito a tu correo.');
    } catch (err: any) {
      setResetError(err.message || 'No fue posible enviar el enlace.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070B11] flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center">
        <Image
          src="/brand/settermind-logo.png"
          alt="SetterMind Logo"
          width={180}
          height={60}
          className="h-14 w-auto object-contain"
          priority
        />
        <h1 className="text-xl font-black tracking-tight text-white mt-3">SetterMind AI</h1>
        <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
          Mentes al Mercado
        </p>
      </div>

      <div className="w-full max-w-md bg-[#111A28] border border-[#24334A] rounded-2xl p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Bienvenido al Centro de Mando</h2>
          <p className="text-xs text-slate-400 mt-1">Ingresa con tus credenciales registradas</p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="email">
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
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-sky-400 hover:text-sky-300 transition cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{isLoading ? 'Iniciando Sesión...' : 'Entrar al Centro de Mando →'}</span>
          </button>
        </form>

        <div className="pt-4 mt-6 border-t border-[#24334A] text-center">
          <p className="text-xs text-slate-400">
            ¿Tienes una clave de licencia nueva?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-sky-400 hover:text-sky-300 font-semibold"
            >
              Activa tu cuenta aquí
            </button>
          </p>
        </div>
      </div>

      {/* Modal de Recuperación */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111A28] border border-[#24334A] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">¿Olvidaste tu contraseña?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Ingresa tu correo para recibir un enlace de restablecimiento</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetMessage(null);
                  setResetError(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {resetMessage ? (
              <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-4 text-xs text-emerald-300 space-y-2">
                <p className="font-semibold">✓ Correo enviado</p>
                <p className="leading-relaxed">{resetMessage}</p>
                <p className="text-slate-400 text-[11px] pt-1">Revisa tu bandeja de entrada o spam.</p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {resetError && (
                  <div className="bg-rose-950/40 border border-rose-800 rounded-lg p-2.5 text-xs text-rose-300">
                    {resetError}
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Correo Electrónico Registrado
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-lg shadow-sky-950/40 disabled:opacity-60 cursor-pointer"
                >
                  {isSendingReset ? 'Enviando enlace...' : 'Enviar enlace de restablecimiento →'}
                </button>

                <div className="pt-2 border-t border-[#1E2D42] text-center">
                  <p className="text-[11px] text-slate-400">
                    ¿Necesitas soporte?{' '}
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=servicioalcliente@mentesalmercado.online&su=Recuperaci%C3%B3n%20de%20Acceso%20SetterMind"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:text-sky-300 underline"
                    >
                      Escríbenos a servicio al cliente
                    </a>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
