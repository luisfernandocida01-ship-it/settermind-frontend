'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

interface ProfileMagnetData {
  name_seo?: string;
  bio?: string;
  cta_link?: string;
  highlight_covers?: string[];
  avatar_prompt?: string;
  // Compatibilidad hacia atrás si la API responde campos antiguos
  cta?: string;
}

export default function ProfileMagnetPage() {
  const router = useRouter();

  const [niche, setNiche] = useState('');
  const [transformation, setTransformation] = useState('');
  const [leadMagnet, setLeadMagnet] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [magnetResult, setMagnetResult] = useState<ProfileMagnetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleGenerateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim() || !transformation.trim()) {
      alert('Por favor completa el nicho y el resultado/transformación que ofreces.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-profile-magnet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          niche: niche.trim(),
          transformation: transformation.trim(),
          lead_magnet: leadMagnet.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'No se pudo optimizar el perfil.');
      }

      setMagnetResult(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const bioLength = magnetResult?.bio ? magnetResult.bio.length : 0;
  const nameSeoLength = magnetResult?.name_seo ? magnetResult.name_seo.length : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2">
      {/* Tarjeta del Formulario Principal */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-7 md:p-8 shadow-xl">
        <div className="text-center mb-6">
          <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
            Fase 2 • Autoridad Orgánica
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Perfil Magnético (Bio, SEO & Posicionamiento)
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            Configura tu anclaje de autoridad fijo y rota tu gancho hacia el recurso del momento para capturar prospectos calificados en frío.
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-amber-950/40 border border-amber-700/60 text-amber-300 p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nicho o Audiencia a la que ayudas
            </label>
            <input
              type="text"
              required
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ej: Consultores de Ventas, Infoproductores, Dueños de Negocio..."
              className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Transformación / Resultado Concreto que ofreces
            </label>
            <input
              type="text"
              required
              value={transformation}
              onChange={(e) => setTransformation(e.target.value)}
              placeholder="Ej: Incrementar en un 30% las ventas cerradas implementando sistemas de IA..."
              className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Recurso Gratuito o Lead Magnet (Opcional)
            </label>
            <input
              type="text"
              value={leadMagnet}
              onChange={(e) => setLeadMagnet(e.target.value)}
              placeholder="Ej: Guía de 7 Pasos para Impulsar tus Ventas con Inteligencia Artificial"
              className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            <span>🧲</span>
            <span>{isGenerating ? 'Optimizando Perfil con IA...' : 'Generar Estructura Magnética'}</span>
          </button>
        </form>
      </div>

      {/* Resultados estructurados */}
      {magnetResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#24334A] pb-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Arquitectura del Perfil Magnético
            </h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
              Listo para Instagram & TikTok
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Nombre SEO */}
            <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  1. Nombre en Negrita (SEO Instagram)
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                    nameSeoLength <= 30 ? 'bg-slate-800 text-slate-300' : 'bg-rose-950/60 text-rose-300'
                  }`}>
                    {nameSeoLength}/30
                  </span>
                  <button
                    onClick={() => handleCopy(magnetResult?.name_seo || '', 'name_seo')}
                    className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg border border-[#334155] transition cursor-pointer"
                  >
                    {copiedKey === 'name_seo' ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
              <div className="bg-[#0B121E] p-4 rounded-xl border border-[#24334A]/60 text-sm font-semibold text-white">
                {magnetResult?.name_seo || 'Nombre | Especialidad'}
              </div>
              <p className="text-[11px] text-slate-400">
                Aparece junto a tu usuario en los resultados de búsqueda de Instagram.
              </p>
            </div>

            {/* 2. Llamado a la Acción (CTA) */}
            <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  2. Llamado a la Acción (Link / DM)
                </span>
                <button
                  onClick={() => handleCopy(magnetResult?.cta_link || magnetResult?.cta || '', 'cta')}
                  className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg border border-[#334155] transition cursor-pointer"
                >
                  {copiedKey === 'cta' ? '✓ Copiado' : 'Copiar CTA'}
                </button>
              </div>
              <div className="bg-[#0B121E] p-4 rounded-xl border border-[#24334A]/60 text-sm text-slate-200">
                {magnetResult?.cta_link || magnetResult?.cta || 'Escribe "GUIA" por mensaje directo para recibir el recurso.'}
              </div>
              <p className="text-[11px] text-slate-400">
                Texto para colocar arriba de tu enlace externo o anclar en tu mensaje fijado.
              </p>
            </div>

            {/* 3. Biografía (Full Width) */}
            <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    3. Biografía Estructurada (Formato Vertical)
                  </span>
                  <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                    bioLength <= 150
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                  }`}>
                    {bioLength}/150 caracteres {bioLength <= 150 ? '✓ Válido' : '⚠ Excede límite'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(magnetResult?.bio || '', 'bio')}
                  className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg border border-[#334155] transition cursor-pointer"
                >
                  {copiedKey === 'bio' ? '✓ Copiado' : 'Copiar Bio'}
                </button>
              </div>
              <div className="bg-[#0B121E] p-4 rounded-xl border border-[#24334A]/60 text-sm text-slate-100 whitespace-pre-line leading-relaxed font-sans">
                {magnetResult?.bio || 'Ayudo a [Nicho] a [Resultado]\nMétodo [Nombre]\n👇 Toca el enlace para la guía'}
              </div>
              <p className="text-[11px] text-slate-400">
                Ajustada al límite estricto de 150 caracteres con saltos de línea legibles para dispositivos móviles.
              </p>
            </div>

            {/* 4. Portadas de Highlights */}
            {magnetResult?.highlight_covers && magnetResult.highlight_covers.length > 0 && (
              <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    4. Títulos de Historias Destacadas (Highlights)
                  </span>
                  <button
                    onClick={() => handleCopy(magnetResult.highlight_covers?.join(' | ') || '', 'highlights')}
                    className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg border border-[#334155] transition cursor-pointer"
                  >
                    {copiedKey === 'highlights' ? '✓ Copiado' : 'Copiar Todos'}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {magnetResult.highlight_covers.map((cover, idx) => (
                    <div key={idx} className="bg-[#0B121E] border border-[#24334A] rounded-xl p-3 text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-sky-950/40">
                        {idx + 1}
                      </div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
                        {cover}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Prompt Avatar en Midjourney */}
            {magnetResult?.avatar_prompt && (
              <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      5. Prompt de Foto de Perfil / Avatar (Midjourney v6.1)
                    </span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                      1:1 Ratio
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(magnetResult.avatar_prompt || '', 'avatar')}
                    className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg border border-[#334155] transition cursor-pointer"
                  >
                    {copiedKey === 'avatar' ? '✓ Copiado' : 'Copiar Prompt'}
                  </button>
                </div>
                <div className="bg-[#0B121E] p-4 rounded-xl border border-[#24334A]/60 font-mono text-xs text-amber-200/90 leading-relaxed break-words">
                  {magnetResult.avatar_prompt}
                </div>
                <p className="text-[11px] text-slate-400">
                  Pega este prompt directamente en Midjourney para generar una foto de perfil ejecutiva de máxima resolución y contraste.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
