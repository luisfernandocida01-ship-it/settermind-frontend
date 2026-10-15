// frontend/src/app/conversations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

const STATUS_CONFIG: Record<string, { label: string; badge: string; border: string }> = {
  iniciado: { label: 'Iniciado', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30', border: 'border-blue-500/30' },
  contactado: { label: 'Contactado', badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', border: 'border-indigo-500/30' },
  respondio: { label: 'Respondió', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', border: 'border-amber-500/30' },
  cualificado: { label: 'Cualificado', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', border: 'border-emerald-500/30' },
  cerrado: { label: 'Cerrado (Ganado)', badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30', border: 'border-teal-500/30' },
};

export default function ConversationsPage() {
  const router = useRouter();
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [trackedItems, setTrackedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para notas editables
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchConversations(token);
  }, [router]);

  const fetchConversations = async (token: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/outbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar la bandeja');
      const data = await res.json();
      const list = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
      
      // Separar: 'pending' va a Bandeja de Salida; el resto al CRM de Seguimiento
      setPendingItems(list.filter((item: any) => !item.status || item.status === 'pending'));
      setTrackedItems(list.filter((item: any) => item.status && item.status !== 'pending'));
    } catch (err: any) {
      setError(err.message || 'Error al obtener datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAndOpen = (username: string, opener: string) => {
    navigator.clipboard.writeText(opener);
    const cleanUser = username.replace(/^@/, '').trim();
    window.open(`https://instagram.com/${cleanUser}/`, '_blank');
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/outbox/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (token) fetchConversations(token);
      }
    } catch (e) {
      console.error('Error al actualizar estado:', e);
    }
  };

  const handleSaveNotes = async (id: string) => {
    const token = localStorage.getItem('jwt_token');
    const noteText = editingNotes[id] ?? '';
    setSavingNoteId(id);
    try {
      await fetch(`${API_BASE_URL}/api/outbox/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: noteText }),
      });
    } catch (e) {
      console.error('Error al guardar notas:', e);
    } finally {
      setSavingNoteId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 py-4">
      {/* SECCIÓN 1: BANDEJA DE SALIDA (PENDIENTES) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24334A] pb-4">
          <div>
            <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
              Fase 2 • Ejecución Diaria
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Bandeja de Salida ({pendingItems.length} Pendientes)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Revisa tus prospectos calificados, copia el opener sugerido e inicia la conversación en Instagram.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const token = localStorage.getItem('jwt_token');
              if (token) fetchConversations(token);
            }}
            className="bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl border border-[#334155] transition cursor-pointer self-start sm:self-auto"
          >
            ↻ Actualizar Bandeja
          </button>
        </div>

        {error && (
          <div className="bg-amber-950/40 border border-amber-700/60 text-amber-300 p-3 rounded-xl text-xs text-center">
            {error}
          </div>
        )}

        {pendingItems.length === 0 && !isLoading ? (
          <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-8 text-center text-slate-400 text-xs">
            No tienes openers pendientes por enviar. ¡Gran trabajo! Revisa el seguimiento abajo.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-4 shadow-lg hover:border-slate-600 transition"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg">
                      @{item.prospect_username?.replace(/^@/, '') || 'prospecto'}
                    </span>
                  </div>
                  {item.score && (
                    <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      Score: {item.score}
                    </span>
                  )}
                </div>

                <div className="bg-[#0B121E] border border-[#24334A] p-3.5 rounded-xl space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400">Comentario original:</p>
                  <p className="text-xs text-slate-300 italic">"{item.prospect_comment}"</p>
                </div>

                {item.identified_pain && (
                  <div className="bg-[#0B121E] border border-[#24334A] p-3.5 rounded-xl space-y-1">
                    <p className="text-[11px] font-semibold text-amber-400">Dolor detectado:</p>
                    <p className="text-xs text-slate-300">{item.identified_pain}</p>
                  </div>
                )}

                <div className="bg-sky-950/20 border border-sky-800/30 p-3.5 rounded-xl space-y-1">
                  <p className="text-[11px] font-semibold text-sky-300">Respuesta / Opener seleccionado:</p>
                  <p className="text-xs text-sky-100 font-medium">{item.selected_opener || item.opener || item.chosen_opener || 'Opener no disponible'}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyAndOpen(item.prospect_username, item.selected_opener || item.opener || item.chosen_opener || '')}
                    className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    <span>🚀 Copiar Opener y Abrir Instagram</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item.id, 'contactado')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>✓ Marcar Contactado</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: CRM INTERNO (SEGUIMIENTO Y PIPELINE) */}
      <section className="space-y-6 pt-4 border-t border-[#24334A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/20 mb-2">
              Fase 2 • Pipeline & CRM Interno
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Conversaciones en Seguimiento ({trackedItems.length} Activas)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Controla las etapas de cada prospecto contactado, registra anotaciones y prepara el cierre.
            </p>
          </div>
        </div>

        {trackedItems.length === 0 && !isLoading ? (
          <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-8 text-center text-slate-400 text-xs">
            Aún no has movido conversaciones a seguimiento. Cuando marques un prospecto como contactado, aparecerá aquí en el CRM.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackedItems.map((item) => {
              const currentSt = (item.status || 'iniciado').toLowerCase();
              const badgeConfig = STATUS_CONFIG[currentSt] || STATUS_CONFIG.iniciado;

              return (
                <div
                  key={item.id}
                  className={`bg-[#162032] border ${badgeConfig.border} rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg`}
                >
                  <div className="space-y-3">
                    {/* Header de la tarjeta */}
                    <div className="flex justify-between items-center">
                      <a
                        href={`https://instagram.com/${item.prospect_username?.replace(/^@/, '')}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-sky-400 hover:underline"
                      >
                        @{item.prospect_username?.replace(/^@/, '') || 'prospecto'}
                      </a>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeConfig.badge}`}>
                        {badgeConfig.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic line-clamp-2">
                      "{item.prospect_comment}"
                    </p>

                    {/* Selector de Estado del CRM */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Etapa de Conversación:
                      </label>
                      <select
                        value={currentSt}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className="w-full bg-[#0B121E] border border-[#24334A] text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="iniciado">Iniciado</option>
                        <option value="contactado">Contactado</option>
                        <option value="respondio">Respondió</option>
                        <option value="cualificado">Cualificado</option>
                        <option value="cerrado">Cerrado (Ganado)</option>
                      </select>
                    </div>

                    {/* Notas Internas */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Notas del Prospecto:
                      </label>
                      <textarea
                        rows={2}
                        defaultValue={item.notes || ''}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        placeholder="Objeciones, presupuesto, hora de llamada..."
                        className="w-full bg-[#0B121E] border border-[#24334A] text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-indigo-500 transition resize-none"
                      />
                    </div>
                  </div>

                  {/* Acciones de la tarjeta */}
                  <div className="flex gap-2 pt-2 border-t border-[#24334A]/80">
                    <button
                      type="button"
                      onClick={() => handleSaveNotes(item.id)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-xl text-[11px] transition cursor-pointer"
                    >
                      {savingNoteId === item.id ? 'Guardando...' : '💾 Guardar Notas'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyAndOpen(item.prospect_username, item.selected_opener || item.opener || item.chosen_opener || '')}
                      title="Abrir Chat de Instagram"
                      className="bg-[#0B121E] hover:bg-[#1E293B] border border-[#24334A] text-sky-400 p-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center"
                    >
                      💬
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}