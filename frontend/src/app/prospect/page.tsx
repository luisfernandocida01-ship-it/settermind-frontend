// frontend/src/app/prospect/page.tsx - VERSIÓN FINAL ESTILIZADA & UX MEJORADA

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import Image from 'next/image';
import { useProspectStore } from '@/store/prospectStore';
import { generateStrategy, prospect } from '@/lib/api';

const StatIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center text-slate-400 text-xs font-medium space-x-1">{children}</div>
);

export default function ProspectPage() {
  const { logout } = useAuth();
  const router = useRouter();

  // Estados locales para los formularios
  const [strategyNiche, setStrategyNiche] = useState('');
  const [strategyAvatar, setStrategyAvatar] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');

  // Estado y acciones desde Zustand
  const { foundPosts, isLoading, error, setFoundPosts, setError, setIsLoading, clearResults } = useProspectStore();

  useEffect(() => {
    if (!localStorage.getItem('jwt_token')) {
      router.push('/login');
    }
  }, [router]);

  const handleGenerateStrategy = async () => {
    if (!strategyNiche.trim() || !strategyAvatar.trim()) {
      alert('Por favor, completa los campos de Nicho y Cliente Ideal antes de generar la estrategia.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const strategyData = { niche: strategyNiche, avatar: strategyAvatar };
      const data = await generateStrategy(strategyData);

      const profiles: string[] = Array.isArray(data?.reference_profiles) ? data.reference_profiles : [];
      const hashtags: string[] = Array.isArray(data?.hashtags) ? data.hashtags : [];

      if (profiles.length === 0 && hashtags.length === 0) {
        throw new Error('La IA no devolvió perfiles ni hashtags. Revisa e inténtalo de nuevo.');
      }

      if (hashtags.length > 0) {
        setProfileUsername(hashtags[0].replace(/^#/, ''));
      }

      const suggestions = `Sugerencias generadas:\n\nPerfiles: ${profiles.join(', ')}\nHashtags: ${hashtags.join(', ')}`;
      alert(suggestions);
    } catch (err: any) {
      setError(err.message || 'La generación de estrategia falló.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProspectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await prospect({ hashtag: profileUsername.trim().replace(/^#/, '') });

      if (data.found_posts && data.found_posts.length > 0) {
        setFoundPosts(data.found_posts);
      } else {
        setError(data.message || 'No se encontraron resultados calificados para este perfil.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    clearResults();
    setProfileUsername('');
    setError(null);
  };

  const handleAnalyzeUrl = (urlToAnalyze: string) => {
    if (!urlToAnalyze) {
      alert('No se pudo obtener la URL de este post para analizar.');
      return;
    }
    localStorage.setItem('url_to_analyze', urlToAnalyze);
    router.push('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-2">
      {/* Formularios paso a paso (si no hay resultados cargados) */}
      {(!foundPosts || foundPosts.length === 0) && (
        <>
          {/* PASO 1: Generador de Estrategias */}
          <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-7 shadow-xl">
            <div className="text-center mb-6">
              <span className="inline-block bg-sky-500/10 text-sky-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
                Paso 1
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Generar Estrategia</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Describe tu negocio y la IA te proporcionará perfiles competidores y hashtags para analizar.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="strategyNiche" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nicho / Producto
                </label>
                <input
                  type="text"
                  id="strategyNiche"
                  value={strategyNiche}
                  onChange={(e) => setStrategyNiche(e.target.value)}
                  placeholder="Ej: High-ticket consulting, Fitness para ejecutivos, Software B2B..."
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="strategyAvatar" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Cliente Ideal (Avatar)
                </label>
                <textarea
                  id="strategyAvatar"
                  rows={3}
                  value={strategyAvatar}
                  onChange={(e) => setStrategyAvatar(e.target.value)}
                  placeholder="Ej: Dueños de negocio facturando más de $5,000 USD/mes que necesitan delegar prospección..."
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateStrategy}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                <span>🧠</span>
                <span>{isGenerating ? 'Generando Ideas con IA...' : 'Generar Estrategia con IA'}</span>
              </button>
            </div>
          </div>

          {/* PASO 2: Buscador de Oportunidades */}
          <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-7 shadow-xl">
            <div className="text-center mb-6">
              <span className="inline-block bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
                Paso 2
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Buscar Oportunidades</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Explora publicaciones activas por hashtag o perfil de competencia para calificar prospectos.