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

      // Dividir lineas respetando saltos
      const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (rawLines.length === 0) return;

      // Detectar separador común (, ; 	)
      const firstLine = rawLines[0];
      const delimiter = firstLine.includes(";") ? ";" : firstLine.includes("\t") ? "\t" : ",";

      // Helper para limpiar comillas
      const cleanCell = (str: string) => str.replace(/^["']|["']$/g, '').trim();

      // Mapeo inteligente de encabezados
      const headerTokens = firstLine.split(delimiter).map(c => cleanCell(c).toLowerCase());
      
      const isHeaderRow = headerTokens.some(h => 
        h.includes("url") || h.includes("link") || h.includes("post") || 
        h.includes("user") || h.includes("caption") || h.includes("enlace")
      );

      let urlIdx = -1;
      let userIdx = -1;
      let likesIdx = -1;
      let commentsIdx = -1;
      let captionIdx = -1;

      if (isHeaderRow) {
        headerTokens.forEach((h, idx) => {
          if (urlIdx === -1 && (h.includes("url") || h.includes("link") || h.includes("enlace") || h.includes("publicacion"))) urlIdx = idx;
          if (userIdx === -1 && (h.includes("user") || h.includes("owner") || h.includes("author") || h.includes("cuenta") || h.includes("autor"))) userIdx = idx;
          if (likesIdx === -1 && (h.includes("like") || h.includes("me_gusta") || h.includes("gustas"))) likesIdx = idx;
          if (commentsIdx === -1 && (h.includes("comment") || h.includes("comentario"))) commentsIdx = idx;
          if (captionIdx === -1 && (h.includes("caption") || h.includes("text") || h.includes("desc") || h.includes("copy"))) captionIdx = idx;
        });
      }

      // Normalizador de URL de Instagram para deduplicar
      const cleanIgUrl = (raw: string): string | null => {
        const match = raw.match(/https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
        if (match) {
          return `https://www.instagram.com/${match[2]}/${match[3]}/`;
        }
        return raw.startsWith("http") ? raw.split("?")[0] : null;
      };

      const seenUrls = new Set<string>();
      // Registrar URLs ya existentes en el estado para no duplicarlas
      importedPosts.forEach(p => {
        const clean = cleanIgUrl(p.url);
        if (clean) seenUrls.add(clean);
      });

      const parsedItems: any[] = [];
      const startIndex = isHeaderRow ? 1 : 0;

      for (let i = startIndex; i < rawLines.length; i++) {
        const row = rawLines[i].split(delimiter).map(cleanCell);
        let postUrl = "";
        let username = "cuenta";
        let likes = 0;
        let comments = 0;
        let caption = "Publicación importada para análisis.";

        if (urlIdx !== -1 && row[urlIdx]) {
          postUrl = row[urlIdx];
        } else {
          // Búsqueda heurística de URL en cualquier columna
          const found = row.find(c => c.includes("instagram.com/"));
          if (found) postUrl = found;
          else if (row[0] && row[0].startsWith("http")) postUrl = row[0];
        }

        const normalizedUrl = cleanIgUrl(postUrl);
        if (!normalizedUrl || seenUrls.has(normalizedUrl)) {
          continue; // Descartar si no es enlace válido o ya existe (deduplicación)
        }

        seenUrls.add(normalizedUrl);

        if (userIdx !== -1 && row[userIdx]) username = row[userIdx].replace(/^@/, '');
        if (likesIdx !== -1 && row[likesIdx]) likes = parseInt(row[likesIdx].replace(/[^0-9]/g, '')) || 0;
        if (commentsIdx !== -1 && row[commentsIdx]) comments = parseInt(row[commentsIdx].replace(/[^0-9]/g, '')) || 0;
        if (captionIdx !== -1 && row[captionIdx]) caption = row[captionIdx];

        parsedItems.push({
          url: normalizedUrl,
          ownerUsername: username,
          likesCount: likes,
          commentsCount: comments,
          caption: caption.length > 200 ? caption.slice(0, 197) + "..." : caption
        });
      }

      if (parsedItems.length > 0) {
        setImportedPosts((prev) => {
          const combined = [...parsedItems, ...prev];
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
          <div className="space-y-6">
            {/* Input de URL manual */}
            <div className="bg-[#111A28] border border-[#24334A] rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Extracción Directa por Enlace
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pega el enlace de una publicación o reel de Instagram para analizarlo
                  </p>
                </div>
                <label
                  htmlFor="csv-file-direct-input"
                  className="inline-flex items-center space-x-2 bg-[#162032] hover:bg-[#1C283F] text-emerald-400 hover:text-emerald-300 border border-emerald-900/40 hover:border-emerald-600 font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer select-none shrink-0"
                >
                  <span>📁 Importar Publicaciones CSV</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/C_abc123... o /reel/..."
                  className="flex-1 bg-[#0B121E] border border-[#24334A] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={isLoadingDetails || !postUrl.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/40 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 shrink-0"
                >
                  <span>{isLoadingDetails ? 'Extrayendo...' : '⚡ Analizar Publicación →'}</span>
                </button>
              </div>
            </div>

            {/* Publicaciones Importadas desde CSV */}
            <div className="bg-[#111A28] border border-[#24334A] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Publicaciones Importadas para Análisis
                  </h3>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {importedPosts.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0B121E] border border-[#1E2D42] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-900/50 transition"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-semibold text-sky-400">@{p.ownerUsername}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 text-[11px]">❤️ {p.likesCount}</span>
                          <span className="text-slate-400 text-[11px]">💬 {p.commentsCount}</span>
                        </div>
                        <p className="text-xs text-slate-300 truncate">{p.caption}</p>
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
