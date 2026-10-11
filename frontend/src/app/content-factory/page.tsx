// frontend/src/app/content-factory/page.tsx - VERSIÓN MAESTRA FINAL (BLINDADA)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/useAuth';
import Link from 'next/link';
import { 
  generateContentIdeas, 
  generateContentResource, 
  generateEngagementSequence,
  generateHighlightsStoryboard 
} from '@/lib/api';

// --- COMPONENTE #1: Director de Highlights ---
// --- ¡NUEVO COMPONENTE! ---
const HighlightsDirector = () => {
    const [formData, setFormData] = useState({
        nombre: '', mision: '', metodo: '', resultado: '', oferta: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResults(null);
        try {
            const data = await generateHighlightsStoryboard(formData);
            setResults(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {!results ? (
                <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg mb-12 space-y-4">
                    <h2 className="text-2xl font-bold text-center mb-4">Director de Highlights</h2>
                    <div>
                        <label className="block text-sm mb-1">Tu Nombre</label>
                        <input name="nombre" value={formData.nombre} onChange={handleInputChange} required className="bg-gray-700 w-full p-2.5 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Tu Misión / Tu "Porqué"</label>
                        <textarea name="mision" value={formData.mision} onChange={handleInputChange} required rows={3} className="bg-gray-700 w-full p-2.5 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Nombre de tu Método</label>
                        <input name="metodo" value={formData.metodo} onChange={handleInputChange} required className="bg-gray-700 w-full p-2.5 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Un ejemplo de resultado de cliente</label>
                        <input name="resultado" value={formData.resultado} onChange={handleInputChange} required className="bg-gray-700 w-full p-2.5 rounded-lg" placeholder="Ej: Generó $1,500 en 30 días"/>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full !mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg">
                        {isLoading ? 'Escribiendo Guion...' : '🎬 Generar Guion de Highlights'}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    <button onClick={() => setResults(null)} className="text-blue-400">&larr; Volver a generar</button>
                    {Object.keys(results).map(key => (
                        <div key={key} className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-3 capitalize text-yellow-400">{key.replace('_', ' ')}</h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                {results[key].map((story: string, index: number) => (
                                    <li key={index}>{story}</li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
            )}

            {error && <div className="text-center bg-red-800 p-4 rounded-lg mt-8">{error}</div>}
        </div>
    );
};

// --- COMPONENTE #2: Chispa Creativa (COMPLETO Y BLINDADO) ---
const CreativeSpark = () => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIdeas(null);
    console.log('--- [CreativeSpark] Iniciando... Tema:', topic);
    try {
      const data = await generateContentIdeas({ topic });
      console.log('--- [CreativeSpark] Datos recibidos de la API:', data);
      setIdeas(data);
    } catch (err: any) {
      console.error('--- [CreativeSpark] ¡ERROR!', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg mb-12">
        <div className="mb-4">
          <label htmlFor="topic" className="block mb-2 text-lg font-medium">Tema Principal del Contenido</label>
          <p className="text-sm text-gray-400 mb-4">¿Sobre qué quieres que la IA genere ideas?</p>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            className="bg-gray-700 w-full p-2.5 rounded-lg"
            placeholder="Ej: Cómo superar el miedo a vender"
          />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg">
          {isLoading ? 'Generando Ideas...' : '💡 Generar Chispa Creativa'}
        </button>
      </form>

      {error && <div className="text-center bg-red-800 p-4 rounded-lg mt-8">{error}</div>}

      {ideas && (
        <div className="space-y-8 mt-12">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Tu Serie de Contenidos</h3>
            <ol className="list-decimal list-inside space-y-2">
              {ideas.post_series?.map((item: any, index: number) => {
                const title = typeof item === 'string' ? item : (item.title || JSON.stringify(item));
                return <li key={index}>{title}</li>;
              })}
            </ol>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Estructura para Caso de Estudio</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {ideas.case_study_structure && (typeof ideas.case_study_structure === 'object' && !Array.isArray(ideas.case_study_structure) ?
                Object.entries(ideas.case_study_structure).map(([key, value]) => <li key={key}><strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {String(value)}</li>) :
                Array.isArray(ideas.case_study_structure) ?
                ideas.case_study_structure.map((point: string, index: number) => <li key={index}>{point}</li>) :
                <li>{String(ideas.case_study_structure)}</li>
              )}
            </ul>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Idea para "Problema Oculto"</h3>
              {/* --- ¡CÓDIGO BLINDADO FINAL AQUÍ! --- */}
  {typeof ideas.hidden_problem_idea === 'object' ? (
    <div>
      <p className="text-gray-300 font-semibold">"{ideas.hidden_problem_idea.title}"</p>
      <p className="text-gray-400 italic mt-2">{ideas.hidden_problem_idea.concept}</p>
    </div>
  ) : (
    <p className="text-gray-300 italic">"{ideas.hidden_problem_idea}"</p>
  )}
</div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE #3: Arsenal de Recursos (COMPLETO Y BLINDADO) ---
const ResourceArsenal = () => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsLoading(true); setError(null); setResults(null);
        try {
            const data = await generateContentResource({ topic });
            setResults(data);
        } catch (err: any) { setError(err.message); } 
        finally { setIsLoading(false); }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg mb-12">
                <div className="mb-4">
                    <label htmlFor="resourceTopic" className="block mb-2 text-lg font-medium">Tema del Recurso</label>
                    <p className="text-sm text-gray-400 mb-4">¿Sobre qué problema específico quieres crear una checklist?</p>
                    <input type="text" id="resourceTopic" value={topic} onChange={(e) => setTopic(e.target.value)} required className="bg-gray-700 w-full p-2.5 rounded-lg" placeholder="Ej: Primeros pasos para invertir"/>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg">
                    {isLoading ? 'Creando Checklist...' : '⚙️ Crear Recurso'}
                </button>
            </form>

            {error && <div className="text-center bg-red-800 p-4 rounded-lg mt-8">{error}</div>}

            {results && (
                <div className="bg-gray-800 p-8 rounded-lg">
                    <h2 className="text-3xl font-bold mb-4">{results.title}</h2>
                    <p className="text-gray-300 mb-6 italic">{results.introduction}</p>
                    <h3 className="text-xl font-semibold mb-3">✅ Checklist de Acciones:</h3>
                    <ul className="list-none space-y-3 mb-6">
                        {results.checklist_items?.map((item: any, index: number) => {
                            const stepText = typeof item === 'string' ? item : (item.step || item.description || JSON.stringify(item));
                            return (<li key={index} className="bg-gray-700 p-3 rounded-md flex items-center">
                                <span className="mr-3 text-lg">◻️</span>
                                <span>{stepText}</span>
                            </li>);
                        })}
                    </ul>
                    <h3 className="text-xl font-semibold mb-3">🚀 Siguiente Paso (CTA):</h3>
                    <p className="text-gray-300">{results.cta}</p>
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE #4: Laboratorio de Engagement (COMPLETO Y BLINDADO) ---
const EngagementLab = () => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsLoading(true); setError(null); setResults(null);
        try {
            const data = await generateEngagementSequence({ topic });
            setResults(data);
        } catch (err: any) { setError(err.message); }
        finally { setIsLoading(false); }
    };

    const getStickerEmoji = (type: string | undefined) => {
        if (!type) return '✨';
        if (type.toUpperCase().includes('ENCUESTA')) return '📊';
        if (type.toUpperCase().includes('QUIZ')) return '퀴';
        if (type.toUpperCase().includes('PREGUNTA')) return '❓';
        return '✨';
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg mb-12">
                <div className="mb-4">
                    <label htmlFor="engagementTopic" className="block mb-2 text-lg font-medium">Tema de la Interacción</label>
                    <p className="text-sm text-gray-400 mb-4">¿Sobre qué tema quieres crear una secuencia de Stories?</p>
                    <input type="text" id="engagementTopic" value={topic} onChange={(e) => setTopic(e.target.value)} required className="bg-gray-700 w-full p-2.5 rounded-lg" placeholder="Ej: El principal desafío al crear un curso"/>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg">
                    {isLoading ? 'Diseñando Secuencia...' : '🔬 Generar Secuencia de Stories'}
                </button>
            </form>

            {error && <div className="text-center bg-red-800 p-4 rounded-lg mt-8">{error}</div>}

            {results && results.story_sequence && (
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-center">Tu Secuencia de 5 Stories</h2>
                    {results.story_sequence.map((story: any, index: number) => (
                        <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                            <p className="font-bold text-lg text-yellow-400 mb-2">Story {index + 1}: {story.title || 'Sin Título'}</p>
                            <p className="mb-4 text-gray-300">{story.text || ''}</p>
                            <div className="bg-gray-700 p-4 rounded-md">
                                <p className="font-semibold text-sm text-white">
                                    {getStickerEmoji(story.sticker_type)} Sticker: <span className="font-normal uppercase">{story.sticker_type || 'INDEFINIDO'}</span>
                                </p>
                                {story.sticker_options && Array.isArray(story.sticker_options) &&
                                    <ul className="list-disc list-inside mt-2 text-gray-300 text-sm">
                                        {story.sticker_options.map((opt: string, i: number) => <li key={i}>{opt}</li>)}
                                    </ul>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (sin cambios) ---
// --- El Componente Principal de la Página que maneja las Pestañas (ACTUALIZADO) ---
export default function ContentFactoryPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('director'); // 'director', 'spark', 'arsenal', o 'engagement'
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) { router.push('/login'); }
}, [router]); // El array de dependencias es importante  

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-8">
      {/* Navbar con el nuevo enlace activo */}
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Fábrica de Contenidos</h1>
        {/* Selector de Pestañas (ACTUALIZADO) */}
        <div className="mb-8 flex justify-center border-b border-gray-700">
          <button onClick={() => setActiveTab('director')} className={activeTab === 'director' ? '...' : '...'}>Director de Highlights</button>
          <button onClick={() => setActiveTab('spark')} className={`py-4 px-6 ... ${activeTab === 'spark' ? 'border-blue-500 text-white' : 'text-gray-400'}`}>Chispa Creativa</button>
          <button onClick={() => setActiveTab('arsenal')} className={`py-4 px-6 ... ${activeTab === 'arsenal' ? 'border-blue-500 text-white' : 'text-gray-400'}`}>Arsenal de Recursos</button>
          <button onClick={() => setActiveTab('engagement')} className={`py-4 px-6 ... ${activeTab === 'engagement' ? 'border-blue-500 text-white' : 'text-gray-400'}`}>Laboratorio de Engagement</button>
        </div>
        {/* Contenido de la Pestaña Activa (ACTUALIZADO) */}
        {activeTab === 'director' && <HighlightsDirector />}
        {activeTab === 'spark' && <CreativeSpark />}
        {activeTab === 'arsenal' && <ResourceArsenal />}
        {activeTab === 'engagement' && <EngagementLab />}
      </div>
    </main>
   );
}