'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import { useProspectStore } from '@/store/prospectStore';
import { generateStrategy, prospect } from '@/lib/api';

export default function ProspectPage() {
  const { logout } = useAuth();
  const router = useRouter();

  // Estados locales para los formularios
  const [strategyNiche, setStrategyNiche] = useState('');
  const [strategyAvatar, setStrategyAvatar] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');

  // Estados para chips de hashtags y perfiles generados
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState<string[]>([]);

  // Estado y acciones desde Zustand
  const { foundPosts, isLoading, error, setFoundPosts, setError, setIsLoading, clearResults } = useProspectStore();

  useEffect(() => {
    if (!localStorage.getItem('jwt_token')) {
      router.push('/login');
    }
  }, [router]);

  const handleGenerateStrategy = async () => {
    if (!strategyNiche.trim() || !strategyAvatar.trim()) {
      setError('Por favor, completa los campos de Nicho y Cliente Ideal antes de generar la estrategia.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const strategyData = { niche: strategyNiche, avatar: strategyAvatar };
      const data = await generateStrategy(strategyData);

      const profiles: string[] = Array.isArray(data?.reference_profiles) 
        ? data.reference_profiles 
        : (data?.keywords || []);
      const hashtags: string[] = Array.isArray(data?.hashtags) ? data.hashtags : [];

      if (profiles.length === 0 && hashtags.length === 0) {
        throw new Error('La IA no devolvió hashtags ni términos de búsqueda.');
      }

      setSuggestedProfiles(profiles);
      setSuggestedHashtags(hashtags);

      if (hashtags.length > 0) {
        setProfileUsername(hashtags[0].replace(/^#/, ''));
      }
    } catch (err: any) {
      setError(err.message || 'La generación de estrategia falló.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProspectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUsername.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await prospect({ hashtag: profileUsername.trim().replace(/^#/, '') });

      if (data.found_posts && data.found_posts.length > 0) {
        setFoundPosts(data.found_posts);
      } else {
        setError(data.message || 'No se encontraron publicaciones con comentarios para este término.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar publicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChip = (tag: string) => {
    const cleanTag = tag.replace(/^#/, '').trim();
    setProfileUsername(cleanTag);
  };

  const handleNewSearch = () => {
    clearResults();
    setError(null);
  };

  const handleAnalyzeUrl = (urlToAnalyze: string) => {
    if (!urlToAnalyze) {
      setError('No se pudo obtener la URL de este post para analizar.');
      return;
    }
    localStorage.setItem('url_to_analyze', urlToAnalyze);
    router.push('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2">
      {error && (
        <div className="bg-amber-950/40 border border-amber-700/60 text-amber-300 p-4 rounded-xl text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* VISTA DE RESULTADOS (Si hay posts encontrados) */}
      {foundPosts && foundPosts.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#24334A] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Publicaciones Encontradas ({foundPosts.length})</h2>
              <p className="text-xs text-slate-400 mt-0.5">Término analizado: #{profileUsername}</p>
            </div>
            <button
              onClick={handleNewSearch}
              className="bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl transition border border-[#334155] cursor-pointer"
            >
              ← Nueva Búsqueda
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foundPosts.map((post: any, idx: number) => {
              const author = post.ownerUsername || 'autor_desconocido';
              const likes = post.likesCount ?? 0;
              const comments = post.commentsCount ?? 0;

              return (
                <div key={idx} className="bg-[#162032] border border-[#24334A] rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Header del post con autor y métricas */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-sky-400">@{author}</span>
                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <span>❤️ {likes}</span>
                        <span>💬 {comments}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed">
                      "{post.caption || 'Sin descripción disponible.'}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleAnalyzeUrl(post.url)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer shadow-md"
                  >
                    <span>⚡ Analizar Publicación y Extraer Prospectos</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VISTA DE CONFIGURACIÓN Y BÚSQUEDA */
        <div className="space-y-6">
          {/* PASO 1: Generador de Estrategia */}
          <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-7 shadow-xl space-y-5">
            <div className="text-center">
              <span className="inline-block bg-sky-500/10 text-sky-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
                Paso 1
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Generar Estrategia</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Describe tu oferta y la IA sugerirá los hashtags y palabras clave con mayor concentración de prospectos.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nicho / Producto:</label>
                <input
                  type="text"
                  value={strategyNiche}
                  onChange={(e) => setStrategyNiche(e.target.value)}
                  placeholder="Ej: Certificación en Consultor de Ventas con IA..."
                  className="w-full bg-[#0B121E] border border-[#24334A] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Cliente Ideal (Avatar):</label>
                <textarea
                  rows={3}
                  value={strategyAvatar}
                  onChange={(e) => setStrategyAvatar(e.target.value)}
                  placeholder="Ej: Profesionales de ventas, consultores, dueños de negocio que buscan incorporar IA..."
                  className="w-full bg-[#0B121E] border border-[#24334A] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500 transition"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateStrategy}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{isGenerating ? 'Generando ideas con IA...' : '🧠 Generar Estrategia con IA'}</span>
              </button>
            </div>

            {/* CHIPS ACCIONABLES DE HASHTAGS Y PALABRAS CLAVE */}
            {(suggestedHashtags.length > 0 || suggestedProfiles.length > 0) && (
              <div className="bg-[#0B121E] border border-[#24334A] rounded-xl p-4 space-y-3 mt-4">
                <p className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                  Selecciona un término para buscarlo abajo:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map((tag, idx) => {
                    const clean = tag.replace(/^#/, '');
                    const isSelected = profileUsername.toLowerCase() === clean.toLowerCase();
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectChip(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer font-medium ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-1 ring-sky-400/50'
                            : 'bg-[#162032] border-[#24334A] text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        #{clean}
                      </button>
                    );
                  })}
                  {suggestedProfiles.map((kw, idx) => {
                    const isSelected = profileUsername.toLowerCase() === kw.toLowerCase();
                    return (
                      <button
                        key={`kw-${idx}`}
                        type="button"
                        onClick={() => handleSelectChip(kw)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer font-medium ${
                          isSelected
                            ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-1 ring-indigo-400/50'
                            : 'bg-[#162032] border-[#24334A] text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        🔍 {kw}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* PASO 2: Buscar Oportunidades */}
          <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-7 shadow-xl space-y-5">
            <div className="text-center">
              <span className="inline-block bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
                Paso 2
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Buscar Oportunidades</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Explora publicaciones activas por hashtag para encontrar prospectos calificados.
              </p>
            </div>

            <form onSubmit={handleProspectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Hashtag o Término de Búsqueda:</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500 text-sm">#</span>
                  <input
                    type="text"
                    required
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value.replace(/^#/, ''))}
                    placeholder="InteligenciaArtificial"
                    className="w-full bg-[#0B121E] border border-[#24334A] rounded-xl pl-8 pr-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{isLoading ? 'Rastreando publicaciones en Instagram...' : '🔍 Buscar Oportunidades'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}