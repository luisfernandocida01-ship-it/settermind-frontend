'use client';

import { useState, useEffect, useRef } from 'react';
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

  // Paso 3: Leads y seleccion de openers
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
    const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedPosts, setImportedPosts] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('settermind_imported_csv_posts');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const newItems: any[] = [];

      lines.forEach((line, idx) => {
        // Ignorar encabezados si contienen palabras comunes
        if (idx === 0 && (line.toLowerCase().includes("url") || line.toLowerCase().includes("enlace"))) return;
        
        const cols = line.split(/[,;\t]/).map(c => c.replace(/^["']|["']$/g, '').trim());
        const urlCandidate = cols.find(c => c.includes("instagram.com/p/") || c.includes("instagram.com/reel/"));
        
        if (urlCandidate) {
          newItems.push({
            url: urlCandidate,
            ownerUsername: cols[1] || 'importado',
            likesCount: parseInt(cols[2] || '0') || 0,
            commentsCount: parseInt(cols[3] || '0') || 0,
            caption: cols[4] || 'Publicación importada desde archivo CSV para análisis directo.'
          });
        } else if (cols[0].startsWith("http")) {
          newItems.push({
            url: cols[0],
            ownerUsername: cols[1] || 'importado',
            likesCount: parseInt(cols[2] || '0') || 0,
            commentsCount: parseInt(cols[3] || '0') || 0,
            caption: cols[4] || 'Publicación importada desde archivo CSV para análisis directo.'
          });
        }
      });

      if (newItems.length > 0) {
        setImportedPosts((prev) => {
          const combined = [...newItems, ...prev];
          localStorage.setItem('settermind_imported_csv_posts', JSON.stringify(combined));
          return combined;
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearImported = () => {
    setImportedPosts([]);
    localStorage.removeItem('settermind_imported_csv_posts');
  };

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
                strategyTitle: s.niche || s.name || 'Estrategia Activa',
                strategyAvatar: s.avatar || '',
                strategyNiche: s.niche || ''
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
        console.error('Error al cargar datos del Centro de Mando:', err);
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

      setPostDetails(data.post_details || data);
      const prof = data.profile_analysis || data.profile || {};
      const extractedProfile = {
        niche: prof.niche || data.niche || 'No especificado',
        avatar: prof.avatar || data.avatar || 'No especificado',
        profesion: prof.profesion || data.profesion || '',
        objetivos: prof.objetivos || data.objetivos || [],
        puntos_de_dolor: prof.puntos_de_dolor || data.puntos_de_dolor || []
      };
      setProfileAnalysis(extractedProfile);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error de conexion');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // PASO 2: Extraer comentarios y clasificar leads con IA
  const handleAnalyzeLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim() || !avatar.trim()) {
      setError('Por favor completa tanto el nicho como el cliente ideal.');
      return;
    }

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
        throw new Error(data.detail || data.error || 'Error al analizar comentarios y leads');
      }

      // Normalización completa de cada lead para el renderizado
      const rawLeads = data.leads || [];
      const normalizedLeads = rawLeads.map((l: any) => {
        const comment = l.comment || l.comment_text || l.prospect_comment || l.text || '';
        const openers = l.openers || l.suggested_openers || [];
        const intent = l.intent || l.pain_point_identified || l.identified_pain || 'Alta intención';
        const username = (l.username || l.user || 'prospecto').replace('@', '');
        return {
          ...l,
          username,
          comment,
          openers,
          intent
        };
      });

      setLeads(normalizedLeads);
      setSummary(data.summary || '');

      const initialOpeners: { [key: number]: string } = {};
      normalizedLeads.forEach((lead: any, idx: number) => {
        if (lead.openers && lead.openers.length > 0) {
          initialOpeners[idx] = lead.openers[0];
        }
      });
      setSelectedOpeners(initialOpeners);

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Error de conexion');
    } finally {
      setIsAnalyzingLeads(false);
    }
  };

  // PASO 3: Guardar lead en la bandeja de salida (Outbox)
  const handleAddToOutbox = async (index: number, lead: any) => {
    const chosenOpener = selectedOpeners[index] || (lead.openers && lead.openers[0]) || '';
    if (!chosenOpener) {
      setError('Por favor selecciona un rompehielos (opener) antes de guardar.');
      return;
    }

    setSavingLeadIndex(index);
    setError(null);
    setOutboxSuccess(null);
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/outbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: lead.username,
          prospect_username: lead.username,
          comment: lead.comment || lead.comment_text,
          prospect_comment: lead.comment || lead.comment_text,
          comment_id: lead.id || lead.comment_id || "",
          comment_url: (lead.id || lead.comment_id) && postUrl ? `${postUrl.replace(/\/+$/, '')}/c/${lead.id || lead.comment_id}/` : '',
          intent: lead.intent,
          confidence: lead.confidence,
          score: lead.potential_score || (lead.confidence ? Math.round(lead.confidence / 10) : 9),
          potential_score: lead.potential_score || 9,
          identified_pain: lead.pain_point_identified || lead.intent,
          pain_point_identified: lead.pain_point_identified || lead.intent,
          chosen_opener: chosenOpener,
          selected_opener: chosenOpener,
          opener: chosenOpener,
          post_url: postUrl.trim(),
          product_context: {
            niche: niche.trim(),
            avatar: avatar.trim(),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'No se pudo guardar en la bandeja de salida');
      }

      setSavedLeads((prev) => ({ ...prev, [index]: true }));
      setOutboxSuccess(`@${lead.username} agregado a la Bandeja de Salida.`);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el lead');
    } finally {
      setSavingLeadIndex(null);
    }
  };

  const handleReset = () => {
    setPostUrl('');
    setStep(1);
    setPostDetails(null);
    setProfileAnalysis(null);
    setNiche('');
    setAvatar('');
    setLeads([]);
    setSelectedOpeners({});
    setSavedLeads({});
    setError(null);
    setOutboxSuccess(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-2">
      {error && (
        <div className="bg-amber-950/40 border border-amber-700/60 text-amber-300 p-4 rounded-xl text-xs font-medium text-center">
          {error}
        </div>
      )}

      {outboxSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 p-3 rounded-xl text-xs text-center">
          {outboxSuccess}
        </div>
      )}

      {/* PASO 1: Centro de Mando del Setter */}
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
                onClick={() => router.push('/prospect')}
                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <span>🎯 Radar de Prospectos</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/strategies')}
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
                {dashboardStats.totalSavedPosts > 0 ? '100%' : '0%'}
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
                  <span>{isLoadingDetails ? 'Extrayendo comentarios...' : '⚡ Analizar Publicación →'}</span>
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
                  onClick={() => router.push('/strategies')}
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
                          <span className="text-xs font-bold text-sky-400">@{p.ownerUsername || 'cuenta'}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400">❤️ {p.likesCount ?? 0}</span>
                          <span className="text-[10px] text-slate-400">💬 {p.commentsCount ?? 0}</span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {p.caption || 'Publicación guardada para extracción de leads.'}
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
                    onClick={() => router.push('/prospect')}
                    className="inline-block bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition"
                  >
                    Ir al Radar y Guardar Posts →
                  </button>
                </div>
              )}
            </div>
          </div>

              {/* Tarjeta de Publicaciones Importadas por CSV */}
              <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#24334A]">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Publicaciones Importadas para Análisis</span>
                      <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                        {importedPosts.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">Publicaciones cargadas vía archivo CSV listas para extracción de leads.</p>
                  </div>
                  {importedPosts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearImported}
                      className="text-xs text-slate-400 hover:text-rose-400 transition"
                    >
                      Limpiar lista
                    </button>
                  )}
                </div>

                {importedPosts.length > 0 ? (
                  <div className="space-y-3">
                    {importedPosts.map((p, i) => (
                      <div key={i} className="bg-[#0B121E] border border-[#24334A] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-600/40 transition">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-bold text-emerald-400">@{p.ownerUsername || 'cuenta'}</span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-400">❤️ {p.likesCount ?? 0}</span>
                            <span className="text-[10px] text-slate-400">💬 {p.commentsCount ?? 0}</span>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {p.caption || 'Publicación importada para análisis.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPostUrl(p.url);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs transition cursor-pointer shrink-0"
                        >
                          ⚡ Analizar Publicación
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-[#0B121E] border border-dashed border-[#24334A] rounded-xl space-y-2">
                    <p className="text-xs text-slate-400">Aún no has importado publicaciones desde CSV.</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Seleccionar archivo .CSV para cargar
                    </button>
                  </div>
                )}
              </div>

        </div>
      )}

      {/* PASO 2: Contexto y Congruencia */}
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
              ← Volver al Centro de Mando
            </button>
          </div>

          <PostContextDisplay postDetails={postDetails} profileAnalysis={profileAnalysis} />

          {/* Formulario unico a lo ancho para Contexto de Producto */}
          <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contexto de tu Producto / Oferta</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tu Nicho / Producto:</label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Ej: Curso de Ventas con IA, Agencia de Automatizaciones..."
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tu Cliente Ideal (Avatar):</label>
                <textarea
                  rows={2}
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Ej: Emprendedores, consultores y duenos de negocio que quieren mas prospectos calificados..."
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <button
              onClick={handleAnalyzeLeads}
              disabled={isAnalyzingLeads || !niche.trim() || !avatar.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-xs transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isAnalyzingLeads ? 'Analizando comentarios con IA...' : 'Analizar Comentarios y Extraer Leads →'}</span>
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Leads calificados y seleccion de Rompehielos */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20">
              Paso 3: Leads Calificados ({leads.length})
            </span>
            <button
              onClick={handleReset}
              className="bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-bold py-2 px-4 rounded-xl transition border border-[#334155]"
            >
              ← Volver al Centro de Mando
            </button>
          </div>

          {summary && (
            <div className="bg-[#162032] border border-[#24334A] p-4 rounded-xl text-xs text-slate-300">
              {summary}
            </div>
          )}

          <div className="space-y-4">
            {leads.map((lead: any, idx: number) => {
              const isSaved = !!savedLeads[idx];
              const isSaving = savingLeadIndex === idx;

              return (
                <div key={idx} className="bg-[#162032] border border-[#24334A] rounded-2xl p-5 space-y-4">
                  {/* Cabecera: Usuario a la izquierda y Score en Rojo arriba a la derecha */}
                  <div className="flex items-center justify-between gap-4 border-b border-[#24334A] pb-3">
                    <span className="text-sm font-bold text-sky-400">@{lead.username}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-rose-950/70 border border-rose-500 text-rose-300 shadow-sm shadow-rose-950">
                      Score: {lead.potential_score ? `${lead.potential_score}/10` : (lead.confidence ? `${Math.round(lead.confidence / 10)}/10` : '9/10')}
                    </span>
                  </div>

                  {/* Comentario Original y Recuadro Destacado de Dolor */}
                  <div className="text-xs text-slate-300 bg-[#0B121E] p-4 rounded-xl border border-[#24334A] space-y-3">
                    <div>
                      <span className="font-semibold text-slate-400 block mb-1">Comentario original:</span>
                      <p className="text-slate-200 italic leading-relaxed">"{lead.comment || lead.comment_text}"</p>
                    </div>

                    {(lead.pain_point_identified || lead.intent) && (
                      <div className="pt-2.5 border-t border-[#1E293B]">
                        <span className="text-amber-400 font-semibold block mb-0.5">⚠️ Dolor / Necesidad Detectada:</span>
                        <p className="text-slate-300 leading-relaxed">{lead.pain_point_identified || lead.intent}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">Selecciona un rompehielos (Opener):</span>
                    <div className="space-y-2">
                      {(lead.openers || []).map((opener: string, oIdx: number) => {
                        const cleanOpener = opener.replace(/^Opener\s*\d*\s*[:\-]?\s*/i, '');
                        const isSelected = selectedOpeners[idx] === cleanOpener || selectedOpeners[idx] === opener;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => setSelectedOpeners((prev) => ({ ...prev, [idx]: cleanOpener }))}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-2 ${
                              isSelected
                                ? 'bg-sky-600/20 border-sky-500 text-white shadow-sm'
                                : 'bg-[#0B121E] border-[#24334A] text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <span className={`inline-block w-3 h-3 rounded-full mt-0.5 shrink-0 ${isSelected ? 'bg-sky-400 ring-2 ring-sky-500/40' : 'border border-slate-600'}`} />
                            <span className="flex-1 leading-relaxed">{cleanOpener}</span>
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
