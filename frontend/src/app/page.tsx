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
  const [isLoadingDetailsLeads, setIsAnalyzingLeads] = useState(false);
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

      const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (rawLines.length === 0) return;

      const firstLine = rawLines[0];
      const delimiter = firstLine.includes(";") ? ";" : firstLine.includes("\t") ? "\t" : ",";

      // Parser CSV que respeta comillas dobles
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            result.push(cur.trim().replace(/^["']|["']$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim().replace(/^["']|["']$/g, ''));
        return result;
      };

      const headers = parseCsvLine(firstLine).map(h => h.toLowerCase());
      
      let urlIdx = headers.findIndex(h => h.includes("profile_url") || h.includes("url") || h.includes("link") || h.includes("enlace"));
      let userIdx = headers.findIndex(h => h === "username" || h === "user" || h === "cuenta");
      let bioIdx = headers.findIndex(h => h.includes("bio") || h.includes("caption") || h.includes("desc") || h.includes("texto"));
      let likesIdx = headers.findIndex(h => h.includes("like") || h.includes("me_gusta"));
      let commentsIdx = headers.findIndex(h => h.includes("comment") || h.includes("comentario"));

      const seenUrls = new Set<string>();
      importedPosts.forEach(p => seenUrls.add(p.url));

      const parsed: any[] = [];
      const startIndex = headers.length > 0 && (urlIdx !== -1 || userIdx !== -1) ? 1 : 0;

      for (let i = startIndex; i < rawLines.length; i++) {
        const cols = parseCsvLine(rawLines[i]);
        if (cols.length === 0 || !cols.some(c => c.length > 0)) continue;

        let rawUrl = urlIdx !== -1 && cols[urlIdx] ? cols[urlIdx] : cols.find(c => c.includes("instagram.com/")) || cols[0];
        if (!rawUrl || !rawUrl.includes("instagram.com")) continue;

        // Limpiar URL
        const cleanUrl = rawUrl.split("?")[0].replace(/\/$/, "");
        if (seenUrls.has(cleanUrl)) continue;
        seenUrls.add(cleanUrl);

        // Extraer @handle real
        let rawUser = userIdx !== -1 ? cols[userIdx] : "";
        let cleanHandle = "";

        const handleInParens = rawUser.match(/\(@([a-zA-Z0-9._]+)/);
        if (handleInParens) {
          cleanHandle = handleInParens[1];
        } else {
          // Extraer desde la URL de Instagram
          const urlMatch = cleanUrl.match(/instagram\.com\/(?:p\/|reel\/|tv\/)?([a-zA-Z0-9._]+)/);
          cleanHandle = (urlMatch && urlMatch[1] && !['p', 'reel', 'tv'].includes(urlMatch[1])) ? urlMatch[1] : (rawUser.split(" ")[0].replace(/[^a-zA-Z0-9._]/g, '') || "perfil");
        }

        // Extraer bio / caption
        let caption = bioIdx !== -1 && cols[bioIdx] ? cols[bioIdx] : (cols[1] || "Perfil / publicación de Instagram para análisis");
        // Quitar comillas escapadas
        caption = caption.replace(/""/g, '"').replace(/^["']|["']$/g, '');

        let likes = likesIdx !== -1 && cols[likesIdx] ? (parseInt(cols[likesIdx].replace(/[^0-9]/g, '')) || 0) : 0;
        let comments = commentsIdx !== -1 && cols[commentsIdx] ? (parseInt(cols[commentsIdx].replace(/[^0-9]/g, '')) || 0) : 0;

        parsed.push({
          url: cleanUrl,
          ownerUsername: cleanHandle,
          likesCount: likes,
          commentsCount: comments,
          caption: caption.length > 220 ? caption.slice(0, 217) + "..." : caption
        });
      }

      if (parsed.length > 0) {
        setImportedPosts(prev => {
          const updated = [...parsed, ...prev];
          localStorage.setItem('settermind_imported_csv_posts', JSON.stringify(updated));
          return updated;
        });
      }
    };
    reader.readAsText(file, 'latin-1');
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
          <div className="space-y-6">
            {/* Banner Superior */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111A28] border border-[#24334A] p-6 rounded-2xl shadow-xl">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Panel Activo
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Centro de Mando del Setter</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Control de prospección, análisis de contenido y seguimiento de conversaciones.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => router.push('/radar')}
                  className="bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 font-semibold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Radar de Prospectos</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/strategies')}
                  className="bg-[#1C283F] hover:bg-[#253554] text-amber-300 border border-amber-500/30 font-semibold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Mis Estrategias</span>
                </button>
              </div>
            </div>

            {/* 4 Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111A28] border border-[#24334A] p-5 rounded-2xl shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estrategias Guardadas</div>
                <div className="text-3xl font-extrabold text-white">{dashboardStats.totalStrategies}</div>
                <div className="text-[11px] text-slate-400 mt-1">Nichos activos</div>
              </div>
              <div className="bg-[#111A28] border border-[#24334A] p-5 rounded-2xl shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Posts en Radar</div>
                <div className="text-3xl font-extrabold text-emerald-400">{dashboardStats.totalSavedPosts}</div>
                <div className="text-[11px] text-emerald-500/80 mt-1">Oportunidades identificadas</div>
              </div>
              <div className="bg-[#111A28] border border-[#24334A] p-5 rounded-2xl shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bandeja de Salida</div>
                <div className="text-3xl font-extrabold text-amber-400">{dashboardStats.totalOutboxLeads}</div>
                <div className="text-[11px] text-amber-500/80 mt-1">Mensajes listos</div>
              </div>
              <div className="bg-[#111A28] border border-[#24334A] p-5 rounded-2xl shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tasa de Acción</div>
                <div className="text-3xl font-extrabold text-purple-400">100%</div>
                <div className="text-[11px] text-purple-400/80 mt-1">Rastreo activo</div>
              </div>
            </div>

            {/* Cuadrícula de 2 Columnas Superior (lg:grid-cols-12) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Columna Izquierda: Analizar Publicacion Especifica */}
              <div className="lg:col-span-5 bg-[#111A28] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-4">
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
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      URL de Instagram
                    </label>
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
                    disabled={isLoadingDetails || !postUrl.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl text-xs transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{isLoadingDetails ? 'Extrayendo comentarios...' : '⚡ Analizar Publicación →'}</span>
                  </button>
                </form>
              </div>

              {/* Columna Derecha: Publicaciones Listas para Analisis (del Radar) */}
              <div className="lg:col-span-7 bg-[#111A28] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-4">
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
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
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
                      onClick={() => router.push('/radar')}
                      className="inline-block bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition"
                    >
                      Ir al Radar y Guardar Posts →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recuadro Inferior: Publicaciones Importadas para Analisis (CSV) */}
            <div className="bg-[#111A28] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Publicaciones Importadas para Análisis
                  </h3>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {importedPosts.length}
                  </span>
                </div>
                {importedPosts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearImported}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    Limpiar lista
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 -mt-2">
                Publicaciones cargadas vía archivo CSV listas para extracción de leads.
              </p>

              <input
                type="file"
                id="csv-file-direct-input"
                onChange={handleCsvUpload}
                accept=".csv"
                style={{ display: 'none' }}
              />

              {importedPosts.length > 0 ? (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {importedPosts.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0B121E] border border-[#1E2D42] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-900/40 transition"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-bold text-sky-400">@{p.ownerUsername}</span>
                          {p.likesCount > 0 && (
                            <>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400 text-[11px]">❤️ {p.likesCount}</span>
                            </>
                          )}
                          {p.commentsCount > 0 && (
                            <span className="text-slate-400 text-[11px]">💬 {p.commentsCount}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{p.caption}</p>
                      </div>

                      {p.url.includes('/p/') || p.url.includes('/reel/') || p.url.includes('/tv/') ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPostUrl(p.url);
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3.5 rounded-lg text-xs transition cursor-pointer shrink-0 flex items-center space-x-1.5 shadow-sm"
                        >
                          <span>⚡</span>
                          <span>Analizar Post</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-1 rounded-md">
                            Perfil
                          </span>
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#1C283F] hover:bg-[#253554] text-sky-400 hover:text-sky-300 font-semibold py-1.5 px-3 rounded-lg text-xs transition border border-sky-800/40 flex items-center space-x-1"
                          >
                            <span>Ver en IG ↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-[#0B121E] border border-dashed border-[#24334A] rounded-xl space-y-3">
                  <p className="text-xs text-slate-400">Aún no has importado publicaciones desde CSV.</p>
                  <div>
                    <label
                      htmlFor="csv-file-direct-input"
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer py-1.5 px-4 rounded-lg bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-800/40 transition inline-flex items-center space-x-2 select-none"
                    >
                      <span>📁</span>
                      <span>Seleccionar archivo .CSV para cargar</span>
                    </label>
                  </div>
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
              disabled={isLoadingDetailsLeads || !niche.trim() || !avatar.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-xs transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoadingDetailsLeads ? 'Analizando comentarios con IA...' : 'Analizar Comentarios y Extraer Leads →'}</span>
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
