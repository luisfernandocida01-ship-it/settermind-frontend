'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function ProfileMagnetPage() {
  const router = useRouter();

  const [niche, setNiche] = useState('');
  const [transformation, setTransformation] = useState('');
  const [leadMagnet, setLeadMagnet] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [magnetResult, setMagnetResult] = useState<any>(null);
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2">
      {/* Tarjeta del Formulario Principal */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-7 md:p-8 shadow-xl">
        <div className="text-center mb-6">
          <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
            Fase 2 • Autoridad Orgánica
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Imán de Perfil (Bio & Posicionamiento)
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Convierte a los curiosos de tu perfil en prospectos calificados con biografías estructuradas y llamados a la acción claros.
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
              placeholder="Ej: Odontólogos, Infoproductores, Agencias B2B..."
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
              placeholder="Ej: Conseguir de 5 a 10 llamadas cualificadas por semana sin anuncios..."
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
              placeholder="Ej: Guía en PDF de prospección, Plantilla de seguimiento..."
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

      {/* Resultados generados */}
      {magnetResult && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Estructura Recomendada para tu Perfil
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Biografía de Alta Conversión
                </span>
                <button
                  onClick={() => handleCopy(magnetResult?.bio || '', 'bio')}
                  className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg border border-[#334155] transition cursor-pointer"
                >
                  {copiedKey === 'bio' ? '✓ Copiado' : 'Copiar Bio'}
                </button>
              </div>
              <div className="bg-[#0B121E] p-4 rounded-xl border border-[#24334A]/60 text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                {magnetResult?.bio || 'Ayudo a [Nicho] a [Resultado]\n👇 Escribe por DM para enviarte la guía'}
              </div>
            </div>

            <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Llamado a la Acción (CTA)
                </span>
                <button
                  onClick={() => handleCopy(magnetResult?.cta || '', 'cta')}
                  className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg border border-[#334155] transition cursor-pointer"
                >
                  {copiedKey === 'cta' ? '✓ Copiado' : 'Copiar CTA'}
                </button>
              </div>
              <div className="bg-[#0B121E] p-4 rounded-xl border border-[#24334A]/60 text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                {magnetResult?.cta || 'Escribe "SISTEMA" por mensaje directo para darte acceso gratis.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}