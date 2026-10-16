//src/app/conversations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OutboxItem {
  id: string;
  post_url?: string;
  comment_id?: string;
  comment_url?: string;
  prospect_username: string;
  prospect_comment: string;
  identified_pain?: string;
  selected_opener?: string;
  opener?: string;
  chosen_opener?: string;
  score?: number | string;
  status?: string;
  notes?: string;
  created_at?: string;
}

const STATUS_CONFIG: Record<string, { label: string; border: string }> = {
  iniciado: { label: 'Iniciado', border: 'border-slate-700' },
  contactado: { label: 'Contactado', border: 'border-sky-500/40' },
  respondio: { label: 'Respondió', border: 'border-amber-500/40' },
  cualificado: { label: 'Cualificado', border: 'border-indigo-500/40' },
  cerrado: { label: 'Cerrado', border: 'border-emerald-500/40' },
};

export default function ConversationsPage() {
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [showGHLModal, setShowGHLModal] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

  const cleanOpener = (msg: string | undefined | null) => {
    if (!msg) return '';
    return msg.replace(/^opener\s*\d*\s*[:\-]?\s*/i, '').trim();
  };

  const fetchConversations = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/outbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Error al cargar conversaciones');
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      fetchConversations(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/outbox/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar el estado');
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status: newStatus } : it))
      );
    } catch (err: any) {
      alert(err.message || 'Error actualizando estado');
    }
  };

  const handleSaveNotes = async (id: string) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    const noteToSave = editingNotes[id] ?? '';
    try {
      setSavingNoteId(id);
      const res = await fetch(`${API_BASE_URL}/api/outbox/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: noteToSave }),
      });
      if (!res.ok) throw new Error('No se pudo guardar la nota');
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, notes: noteToSave } : it))
      );
    } catch (err: any) {
      alert(err.message || 'Error guardando notas');
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleOpenComment = (commentUrl: string | undefined, postUrl: string | undefined, openerText: string) => {
    if (openerText) {
      navigator.clipboard.writeText(cleanOpener(openerText));
    }
    const targetUrl = commentUrl || postUrl || 'https://instagram.com';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyAndOpen = (username: string, opener: string) => {
    if (opener) {
      navigator.clipboard.writeText(cleanOpener(opener));
    }
    const cleanUser = username.replace(/^@/, '');
    window.open(`https://instagram.com/${cleanUser}/`, '_blank', 'noopener,noreferrer');
  };

  const pendingItems = items.filter((it) => !it.status || it.status.toLowerCase() === 'pending');
  const trackedItems = items.filter((it) => it.status && it.status.toLowerCase() !== 'pending');

  const handleExportCSV = () => {
    const listToExport = trackedItems.length > 0 ? trackedItems : items;
    if (!listToExport || listToExport.length === 0) {
      alert('No hay prospectos para exportar.');
      return;
    }

    const headers = ['Usuario', 'Comentario Original', 'Dolor Detectado', 'Opener Utilizado', 'Etapa', 'Notas', 'Score', 'Fecha'];
    const rows = listToExport.map((item) => [
      `"${(item.prospect_username || '').replace(/"/g, '""')}"`,
      `"${(item.prospect_comment || '').replace(/"/g, '""')}"`,
      `"${(item.identified_pain || '').replace(/"/g, '""')}"`,
      `"${(cleanOpener(item.selected_opener || item.opener || item.chosen_opener) || '').replace(/"/g, '""')}"`,
      `"${(item.status || 'Contactado').replace(/"/g, '""')}"`,
      `"${(editingNotes[item.id] ?? item.notes ?? '').replace(/"/g, '""')}"`,
      `"${item.score || 9}"`,
      `"${new Date().toLocaleDateString()}"`,
    ]);

    const newline = String.fromCharCode(10);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join(newline);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `settermind_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 py-4">
      {/* SECCIÓN 1: BANDEJA DE SALIDA (PENDIENTES) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            className="bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-[#334155] transition flex items-center space-x-1 cursor-pointer"
          >
            <span>↻ Actualizar Bandeja</span>
          </button>
        </div>

        {error && (
          <div className="bg-amber-950/40 border border-amber-700/60 text-amber-300 p-4 rounded-xl text-xs">
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-rose-950/70 border border-rose-500 text-rose-300 shadow-sm shadow-rose-950">
                    Score: {item.score ? (Number(item.score) > 10 ? Math.round(Number(item.score) / 10) : item.score) : 9}/10
                  </span>
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
                  <p className="text-xs text-sky-100 font-medium">{cleanOpener(item.selected_opener || item.opener || item.chosen_opener) || 'Opener no disponible'}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenComment(item.comment_url, item.post_url, item.selected_opener || item.opener || item.chosen_opener || '')}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                    title="Abre directamente el comentario y copia tu opener al portapapeles"
                  >
                    <span>💬 Responder Comentario</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyAndOpen(item.prospect_username, item.selected_opener || item.opener || item.chosen_opener || '')}
                    className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                    title="Abre el perfil para enviar mensaje directo privado"
                  >
                    <span>✉️ Abrir DM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item.id, 'contactado')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
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

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-[#1E293B] hover:bg-[#2A3B53] text-slate-200 border border-[#334155] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              title="Exportar base de leads en seguimiento a formato Excel / CSV"
            >
              <span>📥 Exportar a CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGHLModal(true)}
              className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
              title="Sincronizar directamente con GoHighLevel CRM"
            >
              <span>⚡ Enviar a GoHighLevel</span>
            </button>
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
                  className={`bg-[#162032] border ${badgeConfig.border} rounded-2xl p-5 space-y-4 shadow-lg`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <a
                        href={`https://instagram.com/${item.prospect_username?.replace(/^@/, '') || ''}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-sky-400 hover:underline"
                      >
                        @{item.prospect_username?.replace(/^@/, '') || 'prospecto'}
                      </a>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeConfig.border} text-slate-300`}>
                        {badgeConfig.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic line-clamp-2">
                      "{item.prospect_comment}"
                    </p>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Etapa de Conversación:
                      </label>
                      <select
                        value={currentSt}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className="w-full bg-[#0B121E] border border-[#24334A] text-slate-200 text-xs rounded-xl p-2 outline-none focus:border-indigo-500 transition"
                      >
                        <option value="iniciado">Iniciado</option>
                        <option value="contactado">Contactado</option>
                        <option value="respondio">Respondió</option>
                        <option value="cualificado">Cualificado</option>
                        <option value="cerrado">Cerrado (Ganado)</option>
                      </select>
                    </div>

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

      {/* Modal Teaser: GoHighLevel CRM */}
      {showGHLModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#111C2E] border border-[#24334A] rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-2xl shadow-lg">
              ⚡
            </div>
            
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
                Próximamente • Plan Pro
              </div>
              <h3 className="text-lg font-bold text-white">Sincronización Directa GoHighLevel</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Podrás inyectar cada prospecto automáticamente en tus <strong>Pipelines, Oportunidades y Workflows de GoHighLevel</strong> con sus etiquetas, dolor detectado y opener en 1 solo clic.
              </p>
            </div>

            <div className="bg-[#0B121E] border border-[#24334A] p-3 rounded-xl text-xs text-slate-400 space-y-1">
              <p className="text-slate-300 font-semibold">💡 Mientras tanto:</p>
              <p>Usa el botón <strong>"Exportar a CSV"</strong> para cargar tus contactos directamente al módulo de Contactos de GoHighLevel.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowGHLModal(false)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                Entendido, ¡gracias!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}