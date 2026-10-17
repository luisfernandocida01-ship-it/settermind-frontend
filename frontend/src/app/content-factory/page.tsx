'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function ContentFactoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'highlights' | 'spark' | 'arsenal' | 'engagement'>('highlights');

  // Estados Formulario 1: Highlights
  const [name, setName] = useState('');
  const [mission, setMission] = useState('');
  const [methodName, setMethodName] = useState('');
  const [resultExample, setResultExample] = useState('');

  // Estados Formulario 2, 3 y 4
  const [sparkTopic, setSparkTopic] = useState('');
  const [arsenalResource, setArsenalResource] = useState('');
  const [engagementQuestion, setEngagementQuestion] = useState('');

  // Estados de control general
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [multimediaPrompts, setMultimediaPrompts] = useState<string | null>(null);
  const [loadingMultimedia, setLoadingMultimedia] = useState(false);
  const [copiedMultimedia, setCopiedMultimedia] = useState(false);

  const handleGenerateMultimedia = async () => {
    setLoadingMultimedia(true);
    setMultimediaPrompts(null);
    try {
      const token = localStorage.getItem('jwt_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';
      const res = await fetch(`${API_URL}/api/generate-multimedia-prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          highlight_title: activeTab === 'spark' ? 'Chispa Creativa (Ideas Diarias)' : 'Director de Highlights',
          script_content: generatedContent || ''
        })
      });
      if (!res.ok) throw new Error('Error al generar prompts multimedia.');
      const data = await res.json();
      setMultimediaPrompts(typeof data === 'string' ? data : data.result || JSON.stringify(data, null, 2));
    } catch (err: any) {
      alert(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoadingMultimedia(false);
    }
  };

  const handleCopyMultimedia = () => {
    if (!multimediaPrompts) return;
    navigator.clipboard.writeText(multimediaPrompts);
    setCopiedMultimedia(true);
    setTimeout(() => setCopiedMultimedia(false), 2000);
  };

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Manejador central de peticiones a la API
  const handleGenerate = async (endpoint: string, payload: any) => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setCopied(false);

    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Error al generar el contenido con la IA.');
      }

      // Soporta respuesta en formato texto directo, objeto result, content o scripts
      const output =
        typeof data === 'string'
          ? data
          : data.result ||
            data.content ||
            data.script ||
            (Array.isArray(data.scripts) ? data.scripts.join('\n\n') : JSON.stringify(data, null, 2));

      setGeneratedContent(output);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'highlights', label: 'Director de Highlights' },
    { id: 'spark', label: 'Chispa Creativa' },
    { id: 'arsenal', label: 'Arsenal de Recursos' },
    { id: 'engagement', label: 'Laboratorio de Engagement' },
  ] as const;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2">
      {/* Título Principal */}
      <div className="text-center space-y-2">
        <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20">
          Fase 2 • Contenidos de Autoridad
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Fábrica de Contenidos</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Genera activos de contenido magnético para tus historias, historias destacadas y publicaciones.
        </p>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-[#24334A] pb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setGeneratedContent(null);
                setError(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40'
                  : 'bg-[#162032] text-slate-300 hover:bg-[#1E293B] hover:text-white border border-[#24334A]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tarjeta de Formularios */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-7 md:p-8 shadow-xl">
        {error && (
          <div className="mb-5 bg-amber-950/40 border border-amber-700/60 text-amber-300 p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* 1. Director de Highlights */}
        {(activeTab === 'highlights' || activeTab === 'spark') && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate('generate-highlights', {
                name,
                mission,
                method_name: methodName,
                result_example: resultExample,
              });
            }}
            className="space-y-4"
          >
            <div className="border-b border-[#24334A] pb-3 mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Director de Highlights (Historias Destacadas)</h2>
              <p className="text-xs text-slate-400 mt-1">Estructura tus historias fijas para convertirlas en tu carta de presentación.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Tu Nombre o Marca</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Luis Fernando"
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Tu Misión / Tu &quot;Por qué&quot;</label>
              <textarea
                rows={3}
                required
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Ej: Ayudar a emprendedores a cualificar prospectos en frío sin invertir fortunas en anuncios..."
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nombre de tu Método / Sistema</label>
              <input
                type="text"
                required
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
                placeholder="Ej: Método Setter Consultivo 3 Fases"
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Ejemplo de resultado o caso de éxito</label>
              <input
                type="text"
                required
                value={resultExample}
                onChange={(e) => setResultExample(e.target.value)}
                placeholder="Ej: Generó 5 reuniones cualificadas en su primera semana de prospección..."
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              <span>🎬</span>
              <span>{isLoading ? 'Generando Highlights con IA...' : 'Generar Guion de Highlights con IA'}</span>
            </button>
          </form>
        )}

        {/* 2. Chispa Creativa */}
        {activeTab === 'spark' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate('generate-content-ideas', { topic: sparkTopic });
            }}
            className="space-y-4"
          >
            <div className="border-b border-[#24334A] pb-3 mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Chispa Creativa (Ideas Diarias)</h2>
              <p className="text-xs text-slate-400 mt-1">Obtén ángulos de publicaciones y ganchos de conversación listos para postear.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Tema o Pilar de Contenido</label>
              <input
                type="text"
                required
                value={sparkTopic}
                onChange={(e) => setSparkTopic(e.target.value)}
                placeholder="Ej: Objeciones comunes al prospectar por mensaje directo..."
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              <span>⚡</span>
              <span>{isLoading ? 'Encendiendo Chispa...' : 'Generar Ideas de Contenido'}</span>
            </button>
          </form>
        )}

        {/* 3. Arsenal de Recursos */}
        {activeTab === 'arsenal' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate('generate-lead-magnet-plan', { resource_type: arsenalResource });
            }}
            className="space-y-4"
          >
            <div className="border-b border-[#24334A] pb-3 mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Arsenal de Recursos (Lead Magnets)</h2>
              <p className="text-xs text-slate-400 mt-1">Estructura plantillas y guías descargables para intercambiar por conversaciones.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Tipo de Recurso que deseas crear</label>
              <input
                type="text"
                required
                value={arsenalResource}
                onChange={(e) => setArsenalResource(e.target.value)}
                placeholder="Ej: Cheatsheet de 5 pasos para calificar prospectos..."
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              <span>📦</span>
              <span>{isLoading ? 'Estructurando Recurso...' : 'Estructurar Recurso de Alto Valor'}</span>
            </button>
          </form>
        )}

        {/* 4. Laboratorio de Engagement */}
        {activeTab === 'engagement' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate('generate-engagement-poll', { question: engagementQuestion });
            }}
            className="space-y-4"
          >
            <div className="border-b border-[#24334A] pb-3 mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Laboratorio de Engagement (Encuestas & Stickers)</h2>
              <p className="text-xs text-slate-400 mt-1">Crea dinámicas para historias que inviten al prospecto a interactuar por DM.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Pregunta o Conversación Central</label>
              <input
                type="text"
                required
                value={engagementQuestion}
                onChange={(e) => setEngagementQuestion(e.target.value)}
                placeholder="Ej: ¿Te cuesta iniciar conversaciones con desconocidos en redes?"
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              <span>🔬</span>
              <span>{isLoading ? 'Creando Dinámica...' : 'Generar Dinámica de Conversación'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Resultados de la Generación */}
      {/* Resultados de la Generación */}
      {generatedContent && (
        <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#24334A] pb-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Resultado Generado por IA
            </span>
            <div className="flex items-center space-x-2">
              {(activeTab === 'highlights' || activeTab === 'spark') && (
                <button
                  type="button"
                  onClick={handleGenerateMultimedia}
                  disabled={loadingMultimedia}
                  className="text-xs font-bold py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition cursor-pointer shadow-md shadow-purple-950/40 disabled:opacity-60 flex items-center space-x-1.5"
                >
                  <span>🎨</span>
                  <span>{loadingMultimedia ? 'Diseñando Prompts...' : 'Generar Prompts Multimedia'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                className={`text-xs font-bold py-1.5 px-3 rounded-lg transition cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#1E293B] hover:bg-[#334155] text-slate-300 border border-[#334155]'
                }`}
              >
                {copied ? '✓ Copiado al portapapeles' : 'Copiar Resultado'}
              </button>
            </div>
          </div>

          <div className="bg-[#0B121E] p-5 rounded-xl border border-[#24334A]/60 text-sm text-slate-200 leading-relaxed whitespace-pre-line font-mono">
            {generatedContent}
          </div>

          {/* Panel de Prompts Multimedia */}
          {multimediaPrompts && (
            <div className="mt-6 bg-[#0E1726] border border-purple-500/30 rounded-xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🎬</span>
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Suite de Prompts de Producción (Veo 3.1 • Midjourney • Canva)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMultimedia}
                  className={`text-xs font-bold py-1.5 px-3 rounded-lg transition cursor-pointer ${
                    copiedMultimedia
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-900/50 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40'
                  }`}
                >
                  {copiedMultimedia ? '✓ Prompts Copiados' : 'Copiar Todos los Prompts'}
                </button>
              </div>
              <div className="bg-[#080D1A] p-4 rounded-lg border border-purple-900/40 text-xs text-purple-100 font-mono leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                {multimediaPrompts}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
