// frontend/src/app/strategies/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function StrategiesPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) {
      router.push('/login');
      return;
    }

    const fetchStrategies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/strategies`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || data.detail || 'No se pudieron cargar las estrategias');
        }

        setStrategies(Array.isArray(data.strategies) ? data.strategies : Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar estrategias');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, [router]);

  const handleUseHashtagInRadar = (hashtag: string) => {
    localStorage.setItem('selected_radar_hashtag', hashtag.replace(/^#/, ''));
    router.push('/prospect');
  };

  const handleAnalyzeSavedPost = (url: string) => {
    if (!url) {
      setError('Esta publicación no tiene una URL disponible para analizar.');
      return;
    }
    localStorage.setItem('url_to_analyze', url);
    router.push('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#24334A] pb-6">
        <div>
          <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
            Fase 1 • Planificación
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Estrategia & Oportunidades ({strategies.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Consulta tus nichos guardados, hashtags validados y reutilízalos para rastrear nuevos posts calificados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/prospect')}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-md"
        >
          + Nueva Estrategia en Radar
        </button>
      </div>

      {error && (
        <div className="bg-amber-950/40 border border-amber-700/60 text-amber-300 p-4 rounded-xl text-xs font-medium text-center">
          {error}
        </div>
      )}

      {strategies.length === 0 && !isLoading ? (
        <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">Aún no tienes estrategias guardadas.</p>
          <p className="text-xs text-slate-500 mt-1">Genera una en el Radar de Prospectos y aparecerá registrada aquí.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {strategies.map((strat: any, idx: number) => {
            const hashtagsList = Array.isArray(strat.hashtags) ? strat.hashtags : [];
            const keywordsList = Array.isArray(strat.keywords) ? strat.keywords : [];
            const savedPosts = Array.isArray(strat.saved_posts) ? strat.saved_posts : [];

            return (
              <div key={strat.id || idx} className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Estrategia #{idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{strat.niche}</h3>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {strat.created_at ? new Date(strat.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="bg-[#0B121E] border border-[#24334A] p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-400 mb-1">Avatar / Cliente Ideal:</p>
                  <p className="text-xs text-slate-200 leading-relaxed">{strat.avatar}</p>
                </div>

                {/* Hashtags accionables */}
                {hashtagsList.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">Hashtags Accionables (Clic para buscar en Radar):</p>
                    <div className="flex flex-wrap gap-2">
                      {hashtagsList.map((tag: string, hIdx: number) => (
                        <button
                          type="button"
                          key={hIdx}
                          onClick={() => handleUseHashtagInRadar(tag)}
                          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-3 py-1.5 rounded-full transition cursor-pointer flex items-center space-x-1"
                        >
                          <span>#{tag.replace(/^#/, '')}</span>
                          <span className="text-[10px] text-sky-400">↗</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Palabras Clave */}
                {keywordsList.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">Términos Clave:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {keywordsList.map((kw: string, kIdx: number) => (
                        <span key={kIdx} className="bg-[#0B121E] text-slate-300 border border-[#24334A] text-[11px] px-2.5 py-1 rounded-lg">
                          🔍 {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publicaciones Oportunidad Almacenadas */}
                {savedPosts.length > 0 && (
                  <div className="pt-3 border-t border-[#24334A]/60">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-3">
                      Publicaciones Guardadas ({savedPosts.length}):
                    </p>
                    <div className="space-y-3">
                      {savedPosts.map((post: any, pIdx: number) => (
                        <div
                          key={post.url || pIdx}
                          className="bg-[#0B121E] border border-[#24334A] rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="text-xs font-bold text-sky-400">@{post.ownerUsername || 'autor'}</span>
                              <span className="text-[11px] text-slate-400">❤️ {post.likesCount ?? 0} | 💬 {post.commentsCount ?? 0}</span>
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 italic">"{post.caption || 'Sin descripción disponible.'}"</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAnalyzeSavedPost(post.url)}
                            disabled={!post.url}
                            className="self-start sm:self-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs transition cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ⚡ Analizar y Extraer Leads
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
