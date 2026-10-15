'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import { PostContextDisplay } from '@/components/PostContextDisplay';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function Dashboard() {
  const { logout } = useAuth();
  const router = useRouter();

  const [postUrl, setPostUrl] = useState('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isAnalyzingLeads, setIsAnalyzingLeads] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [postDetails, setPostDetails] = useState<any>(null);
  const [profileAnalysis, setProfileAnalysis] = useState<any>(null);

  // Paso 2: Datos de contexto ingresados por el usuario
  const [niche, setNiche] = useState('');
  const [avatar, setAvatar] = useState('');

  // Paso 3: Leads y selección de openers
  const [leads, setLeads] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [selectedOpeners, setSelectedOpeners] = useState<{ [key: number]: string }>({});
  const [savingLeadIndex, setSavingLeadIndex] = useState<number | null>(null);
  const [savedLeads, setSavedLeads] = useState<{ [key: number]: boolean }>({});
  const [outboxSuccess, setOutboxSuccess] = useState<string | null>(null);

  // Estados del Centro de Mando
  const [dashboardStats, setDashboardStats] = useState({
    totalStrategies: 0,
    totalSavedPosts: 0,
    totalOutboxLeads: 0,
  });
  const [recentSavedPosts, setRecentSavedPosts] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const pendingUrl = localStorage.getItem('url_to_analyze');
    if (pendingUrl) {
      setPostUrl(pendingUrl);
      localStorage.removeItem('url_to_analyze');
    }

    const loadDashboardData = async () => {
      setIsLoadingDashboard(true);
      try {
        const [stratRes, outboxRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/strategies`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/outbox`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        let stratCount = 0;
        let postCount = 0;
        let collectedPosts: any[] = [];

        if (stratRes.ok) {
          const stratData = await stratRes.json();
          const strats = stratData.strategies || [];
          stratCount = strats.length;
          strats.forEach((s: any) => {
            const posts = s.saved_posts || [];
            postCount += posts.length;
            posts.forEach((p: any) => {
              collectedPosts.push({
                ...p,
                strategyTitle: s.niche || s.name || "Estrategia Activa",
                strategyAvatar: s.avatar || "",
                strategyNiche: s.niche || ""
              });
            });
          });
        }

        let outboxCount = 0;
        if (outboxRes.ok) {
          const outData = await outboxRes.json();
          outboxCount = (outData.leads || outData.items || []).length;
        }

        setDashboardStats({
          totalStrategies: stratCount,
          totalSavedPosts: postCount,
          totalOutboxLeads: outboxCount,
        });
        setRecentSavedPosts(collectedPosts.slice(0, 4));
      } catch (err) {
        console.error("Error al cargar datos del Centro de Mando:", err);
      } finally {
        setIsLoadingDashboard(false);
      }
    };
    loadDashboardData();
  }, [router]);

  // PASO 1: Obtener detalles del post y perfil
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl.trim()) return;

    setIsLoadingDetails(true);
    setError(null);
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/get-post-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ post_url: postUrl.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Error al obtener detalles del post');
      }

      setPostDetails(data.post || data);
      setProfileAnalysis(data.profile || null);

      if (data.profile?.niche || data.niche) {
        setNiche(typeof data.profile?.niche === 'string' ? data.profile.niche : data.niche || '');
      }
      if (data.profile?.avatar || data.avatar) {
        setAvatar(typeof data.profile?.avatar === 'string' ? data.profile.avatar : data.avatar || '');
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // PASO 2: Analizar congruencia y extraer prospectos con IA
  const handleAnalyzeCongruence = async () => {
    setIsAnalyzingLeads(true);
    setError(null);
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_url: postUrl.trim(),
          niche: niche.trim(),
          avatar: avatar.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Error al analizar comentarios');
      }

      const receivedLeads = data.leads || [];
      setLeads(receivedLeads);
      setSummary(data.summary || '');

      // Inicializar el opener seleccionado por defecto (el primero de cada lead)
      const initialOpeners: { [key: number]: string } = {};
      receivedLeads.forEach((lead: any, idx: number) => {
        if (lead.suggested_openers && lead.suggested_openers.length > 0) {
          initialOpeners[idx] = lead.suggested_openers[0];
        }
      });
      setSelectedOpeners(initialOpeners);

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Error al generar análisis');
    } finally {
      setIsAnalyzingLeads(false);
    }
  };

  // PASO 3: Guardar en la bandeja de salida (Outbox)
// PASO 3: Guardar en la bandeja de salida (Outbox)
const handleAddToOutbox = async (leadIndex: number, lead: any) => {
    const token = localStorage.getItem('jwt_token');
    
    // Asegurar que no vayan vacíos ni nulos
    const opener = (selectedOpeners[leadIndex] || lead.suggested_openers?.[0] || 'Hola, ¿cómo estás?').trim();
    const authorUsername = (lead.author || lead.username || lead.user || 'prospecto').trim();
    const commentText = (lead.comment_text || lead.comment || 'Comentario de interés').trim();
    const painText = (lead.pain_point_identified || 'Sin dolor registrado').trim();
    const scoreVal = lead.potential_score ? String(lead.potential_score) : '7';

    setSavingLeadIndex(leadIndex);
    setError(null);

    const payload = {
      post_url: postUrl || 'https://instagram.com',
      prospect_username: authorUsername,
      prospect_comment: commentText,
      selected_opener: opener,
      identified_pain: painText,
      score: scoreVal,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/outbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'No se pudo guardar en la bandeja de salida');
      }

      setSavedLeads((prev) => ({ ...prev, [leadIndex]: true }));
      setOutboxSuccess(`¡Lead #${leadIndex + 1} guardado correctamente en la Bandeja de Salida!`);
      setTimeout(() => setOutboxSuccess(null), 3500);
    } catch (err: any) {
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setSavingLeadIndex(null);
    }
  };

  const handleReset = () => {
    setStep(1);
    setPostDetails(null);
    setProfileAnalysis(null);
    setLeads([]);
    setSelectedOpeners({});
    setSavedLeads({});
    setSummary('');
    setPostUrl('');
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="bg-amber-950/40 border border-amber-700/60 text-amber-300 p-3 rounded-xl text-xs text-center">
          {error}
        </div>
      )}

      {outboxSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 p-3 rounded-xl text-xs text-center">
          {outboxSuccess}
        </div>
      )}

      {/* PASO 1: Formulario URL */}
      {step === 1 && (
        <div className="space-y-8">
          {/* Encabezado y bienvenida */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#162032] to-[#101726] border border-[#24334A] p-6 rounded-2xl shadow-xl">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Panel Activo</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Centro de Mando del Setter</h1>
              <p className="text-xs text-slate-400 mt-0.5">Control de prospección, análisis de contenido y seguimiento de conversaciones.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.push("/prospect")}
                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <span>🎯 Radar de Prospectos</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/strategies")}
                className="bg-[#1E293B] hover:bg-[#2B3A52] text-slate-200 border border-[#24334A] font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <span>📁 Mis Estrategias</span>
              </button>
            </div>
          </div>

          {/* 4 KPIs Clave */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#162032] border border-[#24334A] p-5 rounded-2xl shadow-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Estrategias Guardadas</span>
              <div className="text-3xl font-extrabold text-white">{dashboardStats.totalStrategies}</div>
              <span className="text-[11px] text-sky-400 mt-1 block">Nichos activos</span>
            </div>
            <div className="bg-[#162032] border border-[#24334A] p-5 rounded-2xl shadow-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Posts en Radar</span>
              <div className="text-3xl font-extrabold text-emerald-400">{dashboardStats.totalSavedPosts}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Oportunidades identificadas</span>
            </div>
            <div className="bg-[#162032] border border-[#24334A] p-5 rounded-2xl shadow-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Bandeja de Salida</span>
              <div className="text-3xl font-extrabold text-amber-400">{dashboardStats.totalOutboxLeads}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Mensajes listos</span>
            </div>
            <div className="bg-[#162032] border border-[#24334A] p-5 rounded-2xl shadow-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Tasa de Acción</span>
              <div className="text-3xl font-extrabold text-purple-400">
                {dashboardStats.totalSavedPosts > 0 ? "100%" : "0%"}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Rastreo activo</span>
            </div>
          </div>

          {/* Seccion en 2 columnas: Analizador Rapido + Feed de Posts en Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Extraccion Manual Rapida */}
            <div className="lg:col-span-5 bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <span className="inline-block bg-sky-500/10 text-sky-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-sky-500/20 mb-2">
                  Herramienta Directa
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">Analizar Publicación Específica</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pega cualquier enlace público de Instagram para extraer sus comentarios y calificar leads.
                </p>
              </div>

              <form onSubmit={handleUrlSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">URL de Instagram</label>
                  <input
                    type="url"
                    required
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/..."
                    className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoadingDetails}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl text-xs transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  <span>{isLoadingDetails ? "Extrayendo comentarios..." : "⚡ Analizar Publicación →"}</span>
                </button>
              </form>
            </div>

            {/* Columna Derecha: Oportunidades Listas para Analizar */}
            <div className="lg:col-span-7 bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#24334A]">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Publicaciones Listas para Análisis</h2>
                  <p className="text-xs text-slate-400">Posts guardados desde tus búsquedas en el Radar.</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/strategies")}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
                >
                  Ver todas →
                </button>
              </div>

              {isLoadingDashboard ? (
                <div className="py-12 text-center text-xs text-slate-400">Cargando oportunidades del radar...</div>
              ) : recentSavedPosts.length > 0 ? (
                <div className="space-y-3">
                  {recentSavedPosts.map((p, i) => (
                    <div key={i} className="bg-[#0B121E] border border-[#24334A] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-bold text-sky-400">@{p.ownerUsername || "cuenta"}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400">❤️ {p.likesCount ?? 0}</span>
                          <span className="text-[10px] text-slate-400">💬 {p.commentsCount ?? 0}</span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {p.caption || "Publicación guardada para extracción de leads."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPostUrl(p.url);
                          if (p.strategyNiche) setNiche(p.strategyNiche);
                          if (p.strategyAvatar) setAvatar(p.strategyAvatar);
                          const fakeEvent = { preventDefault: () => {} } as any;
                          handleUrlSubmit(fakeEvent);
                        }}
                        className="shrink-0 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold py-2 px-3 rounded-lg transition cursor-pointer"
                      >
                        ⚡ Analizar Ahora
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-slate-400">Aún no tienes publicaciones guardadas en tus estrategias.</p>
                  <button
                    type="button"
                    onClick={() => router.push("/prospect")}
                    className="inline-block bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition"
                  >
                    Ir al Radar y Guardar Posts →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && postDetails && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20">
              Paso 2: Análisis del Post y Congruencia
            </span>
            <button
              onClick={handleReset}
              className="bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-bold py-2 px-4 rounded-xl transition border border-[#334155]"
            >
              ← Analizar otro post
            </button>
          </div>

          <PostContextDisplay postDetails={postDetails} profileAnalysis={profileAnalysis} />

          {/* Formulario único a lo ancho para Contexto de Producto */}
          <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contexto de tu Producto / Oferta</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tu Nicho / Producto:</label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Ej: Creación de contenido y marketing digital"
                  className="w-full bg-[#0B121E] border border-[#24334A] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tu Cliente Ideal (Avatar):</label>
                <textarea
                  rows={3}
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Ej: Emprendedores, dueños de pequeñas empresas y creadores de contenido..."
                  className="w-full bg-[#0B121E] border border-[#24334A] rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeCongruence}
              disabled={isAnalyzingLeads}
              className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isAnalyzingLeads ? 'Analizando comentarios con IA...' : '⚡ Generar análisis de congruencia y resultados'}</span>
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Oportunidades Identificadas */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 mb-1">
                Paso 3: Oportunidades Identificadas
              </span>
              <p className="text-xs text-slate-400">{summary}</p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-bold py-2 px-4 rounded-xl transition border border-[#334155]"
            >
              ← Volver al paso 2
            </button>
          </div>

          <div className="space-y-4">
            {leads.map((lead, idx) => {
              const currentSelectedOpener = selectedOpeners[idx] || lead.suggested_openers?.[0] || '';
              const isSaved = !!savedLeads[idx];
              const isSaving = savingLeadIndex === idx;

              return (
                <div key={idx} className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="bg-[#0B121E] border border-[#24334A] p-3 rounded-xl max-w-xl">
                      <p className="text-xs text-slate-400 font-semibold mb-1">Comentario del prospecto:</p>
                      <p className="text-sm text-slate-200 italic">"{lead.comment_text}"</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                      Score: {lead.potential_score}/10
                    </span>
                  </div>

                  <div className="bg-sky-950/20 border border-sky-800/30 p-3 rounded-xl">
                    <p className="text-xs text-sky-400 font-semibold mb-1">Dolor identificado:</p>
                    <p className="text-xs text-slate-300">{lead.pain_point_identified}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-semibold mb-2">Selecciona un mensaje de apertura (Opener):</p>
                    <div className="space-y-2">
                      {lead.suggested_openers?.map((opener: string, oIdx: number) => {
                        const isSelected = currentSelectedOpener === opener;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => setSelectedOpeners((prev) => ({ ...prev, [idx]: opener }))}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-2 ${
                              isSelected
                                ? 'bg-sky-600/20 border-sky-500 text-white shadow-sm'
                                : 'bg-[#0B121E] border-[#24334A] text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <span className={`inline-block w-3 h-3 rounded-full mt-0.5 shrink-0 ${isSelected ? 'bg-sky-400 ring-2 ring-sky-500/40' : 'border border-slate-600'}`} />
                            <span className="flex-1 leading-relaxed">{opener}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToOutbox(idx, lead)}
                    disabled={isSaving || isSaved}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md cursor-pointer ${
                      isSaved
                        ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <span>
                      {isSaving
                        ? 'Guardando...'
                        : isSaved
                        ? '✓ Guardado en Bandeja de Salida'
                        : '📥 Agregar a Bandeja de Salida'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}