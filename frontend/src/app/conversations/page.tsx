'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function ConversationsPage() {
  const router = useRouter();

  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchConversations();
  }, [router]);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los mensajes del pipeline.');
      }

      const data = await response.json();
      setPendingItems(Array.isArray(data) ? data : data.conversations || []);
    } catch (err: any) {
      // Fallback a localStorage si el backend aún no persiste el pipeline
      const stored = localStorage.getItem('saved_conversations');
      if (stored) {
        try {
          setPendingItems(JSON.parse(stored));
        } catch (e) {
          setError(err.message || 'Error al cargar mensajes pendientes.');
        }
      } else {
        setError(null);
        setPendingItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAndOpen = (item: any) => {
    const textToCopy = item.suggested_response || item.response || item.message || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id || item.username);
      setTimeout(() => setCopiedId(null), 2500);
    }

    if (item.url || item.post_url) {
      window.open(item.url || item.post_url, '_blank');
    } else if (item.username) {
      window.open(`https://www.instagram.com/${item.username.replace('@', '')}/`, '_blank');
    }
  };

  const handleMarkDone = (id: any) => {
    const updated = pendingItems.filter((i) => (i.id || i.username) !== id);
    setPendingItems(updated);
    localStorage.setItem('saved_conversations', JSON.stringify(updated));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#24334A] pb-6">
        <div>
          <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
            Fase 2 • Ejecución Diaria
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
           Bandeja de Salida ({pendingItems.length} Pendientes)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Revisa tus comentarios cualificados, copia la respuesta consultiva y contacta al prospecto.
          </p>
        </div>

        <button
          onClick={fetchConversations}
          className="self-start md:self-auto bg-[#162032] hover:bg-[#1E293B] text-slate-300 border border-[#24334A] text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
        >
          ↻ Actualizar Bandeja
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
          Cargando oportunidades del pipeline...
        </div>
      )}

      {/* Estado Vacío */}
      {!isLoading && pendingItems.length === 0 && (
        <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-12 text-center shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0B121E] border border-[#24334A] flex items-center justify-center text-2xl mx-auto text-sky-400">
            📬
          </div>
          <h3 className="text-lg font-bold text-white">No tienes mensajes pendientes</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Dirígete a <strong className="text-sky-400">Dashboard Principal</strong> o <strong className="text-sky-400">Radar de Prospectos</strong> para analizar una publicación y añadir prospectos a tu bandeja de salida.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition shadow-lg shadow-sky-950/40 cursor-pointer"
          >
            Ir a Cualificar Prospectos →
          </button>
        </div>
      )}

      {/* Lista de Mensajes Pendientes */}
      {!isLoading && pendingItems.length > 0 && (
        <div className="space-y-6">
          {pendingItems.map((item, idx) => {
            const itemKey = item.id || item.username || idx;
            const isCopied = copiedId === itemKey;

            return (
              <div
                key={itemKey}
                className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-5 transition hover:border-sky-500/40"
              >
                {/* Cabecera del Prospecto */}
                <div className="flex items-center justify-between border-b border-[#24334A] pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-[#0B121E] border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-xs">
                      @
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {item.username?.startsWith('@') ? item.username : `@${item.username || 'Usuario Anónimo'}`}
                      </h3>
                      {item.author && item.author !== item.username && (
                        <p className="text-[11px] text-slate-400">{item.author}</p>
                      )}
                    </div>
                  </div>

                  <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-bold px-3 py-1 rounded-full">
                    {item.score ? `Score: ${item.score}/10` : 'Calificado'}
                  </span>
                </div>

                {/* Comentario del Prospecto */}
                <div className="bg-[#0B121E] border border-[#24334A]/60 rounded-xl p-4 text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;{item.comment_text || item.text || item.comment || 'Comentario sin texto registrado'}&rdquo;
                </div>

                {/* Respuesta Consultiva Generada */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Respuesta Consultiva Sugerida:
                  </span>
                  <div className="bg-[#0E1E33] border border-[#1E3A5F] rounded-xl p-4 text-xs text-sky-200 leading-relaxed font-sans">
                    {item.suggested_response || item.response || item.message || 'Sin respuesta sugerida.'}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => handleCopyAndOpen(item)}
                    className="w-full sm:flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-5 rounded-xl text-xs transition shadow-lg shadow-sky-950/40 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>🚀</span>
                    <span>{isCopied ? '¡Copiado! Abriendo destino...' : 'Enviar (Abrir y Copiar)'}</span>
                  </button>

                  <button
                    onClick={() => handleMarkDone(itemKey)}
                    className="w-full sm:w-auto bg-[#1E293B] hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-700/60 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs transition border border-[#334155] cursor-pointer"
                  >
                    ✓ Marcar Enviado
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}