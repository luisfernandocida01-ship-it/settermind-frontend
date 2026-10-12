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
      const response = await fetch(`${API_BASE_URL}/api/outbox`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los mensajes de la Bandeja de Salida.');
      }

      const data = await response.json();
      setPendingItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la bandeja de salida.');
      setPendingItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAndOpen = (item: any) => {
    const textToCopy = item.selected_opener || item.suggested_response || item.response || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }

    const username = item.prospect_username || item.username;
    if (username && username !== 'prospecto') {
      window.open(`https://www.instagram.com/${username.replace('@', '')}/`, '_blank');
    } else if (item.post_url) {
      window.open(item.post_url, '_blank');
    }
  };

  const handleMarkDone = async (id: any) => {
    const token = localStorage.getItem('jwt_token');
    try {
      await fetch(`${API_BASE_URL}/api/outbox/${id}/sent`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.error('Error al actualizar estado en backend:', e);
    }

    setPendingItems((prev) => prev.filter((i) => i.id !== id));
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
            Revisa tus prospectos cualificados, copia la apertura sugerida y contáctalos de inmediato.
          </p>
        </div>

        <button
          onClick={fetchConversations}
          disabled={isLoading}
          className="self-start md:self-auto bg-[#162032] hover:bg-[#1E293B] text-slate-300 border border-[#24334A] text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
        >
          {isLoading ? 'Cargando...' : '↻ Actualizar Bandeja'}
        </button>
      </div>

      {error && (
        <div className="bg-amber-950/40 border border-amber-700/60 text-amber-300 p-4 rounded-xl text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* Lista de Leads en Bandeja */}
      {pendingItems.length === 0 && !isLoading ? (
        <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">No tienes mensajes pendientes en la bandeja de salida.</p>
          <p className="text-xs text-slate-500 mt-1">Analiza una publicación en el Dashboard y agrega oportunidades aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <div key={item.id} className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-500/20">
                    @
                  </span>
                  <p className="text-sm font-bold text-white">
                    @{item.prospect_username || 'prospecto'}
                  </p>
                </div>
                {item.score && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                    Score: {item.score}/10
                  </span>
                )}
              </div>

              {/* Comentario Original */}
              <div className="bg-[#0B121E] border border-[#24334A] p-3.5 rounded-xl">
                <p className="text-xs text-slate-400 font-semibold mb-1">Comentario original:</p>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  "{item.prospect_comment || 'Sin comentario registrado'}"
                </p>
              </div>

              {/* Dolor si existe */}
              {item.identified_pain && (
                <div className="bg-sky-950/20 border border-sky-800/30 p-3 rounded-xl">
                  <p className="text-xs text-sky-400 font-semibold mb-0.5">Dolor detectado:</p>
                  <p className="text-xs text-slate-300">{item.identified_pain}</p>
                </div>
              )}

              {/* Opener sugerido */}
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">Respuesta / Opener seleccionado:</p>
                <div className="p-3.5 bg-[#0B121E] border border-[#24334A] rounded-xl text-xs text-slate-200 leading-relaxed">
                  {item.selected_opener || 'Sin respuesta sugerida.'}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyAndOpen(item)}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  <span>{copiedId === item.id ? '✓ ¡Copiado al Portapapeles!' : '🚀 Copiar Opener y Abrir'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkDone(item.id)}
                  className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 border border-[#24334A] font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  ✓ Marcar Enviado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}