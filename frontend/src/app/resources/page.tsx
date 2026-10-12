'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function ProductsHotlinksPage() {
  const router = useRouter();

  // Estados de datos
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('Webinar');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchResources();
  }, [router]);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/resources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron obtener los Hotlinks del servidor.');
      }

      const data = await response.json();
      setResources(Array.isArray(data) ? data : data.resources || []);
    } catch (err: any) {
      // Fallback a localStorage si el backend aún no tiene la ruta lista
      const local = localStorage.getItem('hotlinks_portfolio');
      if (local) {
        try {
          setResources(JSON.parse(local));
        } catch (e) {
          setError(null);
          setResources([]);
        }
      } else {
        // Recursos precargados de ejemplo inicial
        const initialSamples = [
          {
            id: 'sample-1',
            title: 'Masterclass: Secretos de Prospección',
            resource_type: 'Masterclass',
            url: 'https://go.hotmart.com/CLASE_EJEMPLO',
            description: 'Enlace para prospectos fríos que preguntan por el temario.',
          },
          {
            id: 'sample-2',
            title: 'CPL 1: Entrevista Caso de Éxito',
            resource_type: 'CPL',
            url: 'https://go.hotmart.com/CPL1_EJEMPLO',
            description: 'Prueba social para enviar a prospectos con dudas.',
          },
        ];
        setResources(initialSamples);
        localStorage.setItem('hotlinks_portfolio', JSON.stringify(initialSamples));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert('Por favor introduce el título y el Hotlink correspondiente.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const token = localStorage.getItem('jwt_token');

    const newResource = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      resource_type: resourceType,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newResource),
      });

      if (response.ok) {
        const data = await response.json();
        setResources((prev) => [data, ...prev]);
      } else {
        throw new Error('Guardando en almacenamiento local.');
      }
    } catch (err: any) {
      // Si el backend no responde, se guarda localmente en el navegador
      const updated = [newResource, ...resources];
      setResources(updated);
      localStorage.setItem('hotlinks_portfolio', JSON.stringify(updated));
    } finally {
      setTitle('');
      setUrl('');
      setDescription('');
      setResourceType('Webinar');
      setIsSubmitting(false);
    }
  };

  const handleCopyUrl = (urlToCopy: string, id: any) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id: any) => {
    const updated = resources.filter((r) => r.id !== id);
    setResources(updated);
    localStorage.setItem('hotlinks_portfolio', JSON.stringify(updated));
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Webinar':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'CPL':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Masterclass':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Checkout / Oferta':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Embudo Directo':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-2">
      {/* Encabezado */}
      <div className="border-b border-[#24334A] pb-6">
        <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
          Fase 3 • Gestión & Control
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Portafolio de Productos & Hotlinks de Hotmart
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Centraliza tus enlaces de afiliado y materiales de conversión (Webinars, CPL, Masterclasses y Páginas de Pago) para enviarlos rápidamente durante la conversación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Columna Izquierda: Tabla y Lista de Hotlinks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">
              Hotlinks Activos ({resources.length})
            </h2>
            <button
              onClick={fetchResources}
              className="bg-[#162032] hover:bg-[#1E293B] text-slate-300 border border-[#24334A] text-xs font-semibold py-1.5 px-3 rounded-lg transition cursor-pointer"
            >
              ↻ Refrescar
            </button>
          </div>

          {isLoading ? (
            <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-10 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Cargando portafolio...
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-10 text-center shadow-xl space-y-3">
              <span className="text-3xl">🔗</span>
              <p className="text-sm font-semibold text-white">No tienes Hotlinks registrados</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Registra a la derecha tu primer enlace de Hotmart (por ejemplo, el Webinar o el CPL 1) para tenerlo a mano durante el chat.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((item) => {
                const isCopied = copiedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-[#162032] border border-[#24334A] rounded-xl p-4 shadow-lg space-y-3 transition hover:border-sky-500/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getBadgeStyle(
                              item.resource_type
                            )}`}
                          >
                            {item.resource_type || 'Hotlink'}
                          </span>
                          <h3 className="font-bold text-white text-sm">{item.title}</h3>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-400">{item.description}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-500 hover:text-rose-400 text-xs p-1 transition cursor-pointer"
                        title="Eliminar recurso"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#24334A]/60">
                      <span className="text-xs text-sky-400 font-mono truncate max-w-xs bg-[#0B121E] px-3 py-1.5 rounded-lg border border-[#24334A]/50">
                        {item.url}
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-semibold py-1.5 px-3 rounded-lg border border-[#334155] transition"
                        >
                          Visitar ↗
                        </a>
                        <button
                          onClick={() => handleCopyUrl(item.url, item.id)}
                          className={`text-xs font-bold py-1.5 px-3 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950/40'
                          }`}
                        >
                          <span>{isCopied ? '✓' : '📋'}</span>
                          <span>{isCopied ? 'Copiado' : 'Copiar Hotlink'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Formulario para Añadir Nuevo Hotlink */}
        <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-[#24334A] pb-3">
            <h2 className="text-base font-bold text-white tracking-tight">
              Añadir Nuevo Hotlink
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registra enlaces estratégicos de tu panel de afiliado de Hotmart.
            </p>
          </div>

          <form onSubmit={handleAddResource} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nombre o Título del Recurso
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Masterclass de Cierre, CPL 2..."
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tipo de Recurso (Embudo)
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
              >
                <option value="Webinar">Webinar en Vivo / Repetición</option>
                <option value="CPL">CPL (Contenido Pre-Lanzamiento)</option>
                <option value="Masterclass">Masterclass Gratuita</option>
                <option value="Checkout / Oferta">Página de Pago / Checkout Directo</option>
                <option value="Embudo Directo">Página de Captura / Lead Magnet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Hotlink de Hotmart (URL)
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://go.hotmart.com/..."
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nota o Indicación para el Setter (Opcional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Enviar únicamente si el prospecto pregunta por facilidades de pago..."
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-lg shadow-sky-950/40 cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              <span>+</span>
              <span>{isSubmitting ? 'Guardando Hotlink...' : 'Añadir al Portafolio'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}