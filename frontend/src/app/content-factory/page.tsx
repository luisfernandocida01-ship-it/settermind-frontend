'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function ContentFactoryPage() {
  const router = useRouter();

  const [niche, setNiche] = useState('');
  const [objective, setObjective] = useState('iniciar_conversacion');
  const [tone, setTone] = useState('consultivo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scripts, setScripts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleGenerateScripts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) {
      alert('Por favor ingresa tu nicho o tipo de servicio.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          niche: niche.trim(),
          objective,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'No se pudieron generar los guiones.');
      }

      setScripts(Array.isArray(data.scripts) ? data.scripts : Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-2">
      {/* Formulario Principal */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-7 md:p-8 shadow-xl">
        <div className="text-center mb-6">
          <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
            Fase 2 • Conversión
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Fábrica de Guiones Consultivos
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Diseña aperturas y preguntas estratégicas personalizadas para romper el hielo sin sonar invasivo.
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-amber-950/40 border border-amber-700/60 text-amber-300 p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerateScripts} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nicho o Servicio
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ej: Asesoría financiera, Agencia de contenidos, Coaching High-Ticket..."
              className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Objetivo del Guion
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition"
              >
                <option value="iniciar_conversacion">Iniciar Conversación (Rompehielo)</option>
                <option value="detectar_dolor">Detectar Dolor / Diagnóstico</option>
                <option value="agendar_llamada">Transición a Llamada Consultiva</option>
                <option value="seguimiento">Seguimiento Suave (No invasivo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tono de Comunicación
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition"
              >
                <option value="consultivo">Consultivo & Curioso (Recomendado)</option>
                <option value="directo">Directo y al Grano</option>
                <option value="casual">Casual & Relajado</option>
                <option value="autoridad">Alta Autoridad / Experto</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            <span>💬</span>
            <span>{isGenerating ? 'Generando Guiones con IA...' : 'Generar Guiones'}</span>
          </button>
        </form>
      </div>

      {scripts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Guiones generados</h2>
          {scripts.map((script, index) => {
            const text = typeof script === 'string'
              ? script
              : script.text || script.script || script.content || JSON.stringify(script);
            return (
              <article key={index} className="bg-[#162032] border border-[#24334A] rounded-xl p-5">
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{text}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(text, index)}
                  className="mt-4 text-sm text-sky-400 hover:text-sky-300"
                >
                  {copiedIndex === index ? 'Copiado' : 'Copiar'}
                </button>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}