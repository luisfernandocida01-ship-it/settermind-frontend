'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function HistoryPage() {
  const router = useRouter();

  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchHistory();
  }, [router]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo recuperar el historial de análisis.');
      }

      const data = await response.json();
      setHistoryItems(Array.isArray(data) ? data : data.history || []);
    } catch (err: any) {
      // Fallback a localStorage si el backend aún no persiste el historial
      const localHistory = localStorage.getItem('post_analysis_history');
      if (localHistory) {
        try {
          setHistoryItems(JSON.parse(localHistory));
        } catch (e) {
          setError(err.message || 'Error al cargar el historial.');
        }
      } else {
        setError(null);
        setHistoryItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyze = (url: string) => {
    if (!url) return;
    localStorage.setItem('url_to_analyze', url);
    router.push('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#24334A] pb-6">
        <div>
          <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
            Fase 3 • Gestión & Control
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Historial de Análisis ({historyItems.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Consulta los posts y perfiles que has analizado para reutilizar información o retomar conversaciones.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="self-start md:self-auto bg-[#162032] hover:bg-[#1E293B] text-slate-300 border border-[#24334A] text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
        >
          ↻ Actualizar Historial
        </button>
      </div>

      {error && (
        <div className="bg-amber-950/40 border border-amber-700/60 text-amber-300 p-4 rounded-xl text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* Estado Cargando */}
      {isLoading && (
        <div className="text-center py-16 text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Cargando registros históricos...
        </div>
      )}

      {/* Estado Vacío */}
      {!isLoading && historyItems.length === 0 && (
        <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-12 text-center shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0B121E] border border-[#24334A] flex items-center justify-center text-2xl mx-auto text-sky-400">
            📋
          </div>
          <h3 className="text-lg font-bold text-white">Aún no hay análisis registrados</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Cada vez que proceses una publicación en el <strong className="text-sky-400">Dashboard Principal</strong> o explores con <strong className="text-sky-400">Radar de Prospectos</strong>, se guardará una copia aquí.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition shadow-lg shadow-sky-950/40 cursor-pointer"
          >
            Realizar Primer Análisis →
          </button>
        </div>
      )}

      {/* Lista de Registros Históricos */}
      {!isLoading && historyItems.length > 0 && (
        <div className="space-y-4">
          {historyItems.map((item, idx) => {
            const itemKey = item.id || idx;
            const targetUrl = item.post_url || item.url || '';
            const accountName = item.account_name || item.username || item.author || 'Post Analizado';

            return (
              <div
                key={itemKey}
                className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-4 transition hover:border-sky-500/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#24334A] pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {accountName}
                    </h3>
                    {item.created_at && (
                      <p className="text-[11px] text-slate-400">
                        Fecha: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {item.qualified_count !== undefined && (
                    <span className="self-start sm:self-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold px-3 py-1 rounded-full">
                      {item.qualified_count} Prospectos Calificados
                    </span>
                  )}
                </div>

                {targetUrl && (
                  <p className="text-xs text-sky-400 font-mono truncate bg-[#0B121E] p-3 rounded-xl border border-[#24334A]/60">
                    {targetUrl}
                  </p>
                )}

                {item.summary && (
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  {targetUrl && (
                    <button
                      onClick={() => handleReanalyze(targetUrl)}
                      className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition shadow-md shadow-sky-950/40 cursor-pointer"
                    >
                      Volver a Abrir Análisis →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}