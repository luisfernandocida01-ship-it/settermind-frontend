// frontend/src/app/prospect/page.tsx - VERSIÓN FINAL ESTRUCTURALMENTE CORRECTA

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { useProspectStore } from '@/store/prospectStore';
// ¡Actualizamos la importación!
import { generateStrategy, prospect } from '@/lib/api'; 

// Componente pequeño para el icono de estadísticas
const StatIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center text-gray-400 text-sm">{children}</div>
);

export default function ProspectPage() {
  const { logout } = useAuth();
  const router = useRouter();

  // Estados locales para los formularios
  const [strategyNiche, setStrategyNiche] = useState('');
  const [strategyAvatar, setStrategyAvatar] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileUsername, setProfileUsername] = useState(''); // <-- NUEVO ESTADO PARA EL PERFIL
  
  // Estado y acciones desde Zustand
  const { foundPosts, isLoading, error, setFoundPosts, setError, setIsLoading, clearResults } = useProspectStore();

  useEffect(() => {
    if (!localStorage.getItem('jwt_token')) { 
      router.push('/login'); 
    }
  }, [router]);
  
// En frontend/src/app/prospect/page.tsx

const handleGenerateStrategy = async () => {
  // --- ¡NUEVA VALIDACIÓN! ---
  if (!strategyNiche.trim() || !strategyAvatar.trim()) {
    alert("Por favor, completa los campos de Nicho y Cliente Ideal antes de generar la estrategia.");
    return; // Detenemos la función aquí
  }

  setIsGenerating(true);
  setError(null);
  
  try {
    const strategyData = { niche: strategyNiche, avatar: strategyAvatar };
    console.log("Enviando datos para generar estrategia:", strategyData);
    
    const data = await generateStrategy(strategyData);
    console.log("Respuesta de la IA recibida:", data);

    const profiles: string[] = Array.isArray(data?.reference_profiles) ? data.reference_profiles : [];
    const hashtags: string[] = Array.isArray(data?.hashtags) ? data.hashtags : [];

    if (profiles.length === 0 && hashtags.length === 0) {
      throw new Error("La IA no devolvió perfiles ni hashtags. Revisa la consola e inténtalo de nuevo.");
    }

    if (hashtags.length > 0) {
      setProfileUsername(hashtags[0].replace(/^#/, ''));
    }
    
    const suggestions = `Sugerencias:\n- Perfiles: ${profiles.join(', ')}\n- Hashtags: ${hashtags.join(', ')}`;
    alert(suggestions);

  } catch (err: any) {
    console.error("Error en handleGenerateStrategy:", err);
    // Mostramos el error devuelto por el backend
    setError(err.message || "La generación de estrategia falló.");
  } finally {
    setIsGenerating(false);
  }
};

  const handleProspectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Usamos la nueva función 'prospect' y le pasamos el objeto correcto
      const data = await prospect({ hashtag: profileUsername.trim().replace(/^#/, '') });
      
      if (data.found_posts && data.found_posts.length > 0) {
        setFoundPosts(data.found_posts);
      } else {
        setError(data.message || "No se encontraron resultados calificados para este perfil.");
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewSearch = () => {
    clearResults();
    setProfileUsername('');
    setError(null);
  };

  const handleAnalyzeUrl = (urlToAnalyze: string) => {
    if (!urlToAnalyze) {
        alert("No se pudo obtener la URL de este post para analizar.");
        return;
    }
    localStorage.setItem('url_to_analyze', urlToAnalyze);
    router.push('/');
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-8">
      <nav className="w-full max-w-7xl mb-12 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-3xl font-bold">SetterMind AI</h1>
          <Link href="/" className="text-gray-300 hover:text-white">Dashboard</Link>
          <Link href="/conversations" className="text-gray-300 hover:text-white">Bandeja</Link>
          <Link href="/prospect" className="text-white font-bold">Prospectar</Link>
          <Link href="/history" className="text-gray-300 hover:text-white">Historial</Link>
          <Link href="/strategies" className="text-gray-300 hover:text-white">Estrategias</Link>
          <Link href="/profile-magnet" className="text-gray-300 hover:text-white">Perfil Magnético</Link>
          <Link href="/content-factory" className="text-gray-300 hover:text-white">Fábrica de Contenidos</Link>
          <Link href="/resources" className="text-white font-bold">Portafolio</Link>
        </div>
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Cerrar Sesión</button>
      </nav>

      <div className="w-full max-w-4xl space-y-12">
        {/* Renderizado condicional: Muestra formularios si no hay resultados */}
        {(!foundPosts || foundPosts.length === 0) && (
          <>
            {/* --- Generador de Estrategias --- */}
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">Paso 1: Generar Estrategia</h2>
              <p className="text-gray-400 text-center mb-6">Describe tu negocio y la IA te dará perfiles competidores para analizar.</p>
              <div className="mb-4">
                <label htmlFor="strategyNiche" className="block mb-2 text-sm font-medium text-gray-300">Nicho / Producto</label>
                <input type="text" id="strategyNiche" value={strategyNiche} onChange={(e) => setStrategyNiche(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
              </div>
              <div className="mb-6">
                <label htmlFor="strategyAvatar" className="block mb-2 text-sm font-medium text-gray-300">Cliente Ideal (Avatar)</label>
                <textarea id="strategyAvatar" rows={3} value={strategyAvatar} onChange={(e) => setStrategyAvatar(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5"></textarea>
              </div>
              <button onClick={handleGenerateStrategy} disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg text-lg disabled:bg-purple-800">
                {isGenerating ? 'Generando Ideas...' : '🧠 Generar Estrategia con IA'}
              </button>
            </div>

            {/* --- Buscador de Oportunidades --- */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-6">Paso 2: Buscar Oportunidades</h2>
              <form onSubmit={handleProspectSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <div className="bg-blue-900/50 border border-blue-700 text-blue-200 p-4 rounded-md mb-6">
                  <h4 className="font-bold mb-2">💡 Pro Tip: Análisis de Competencia</h4>
                  <p className="text-sm">Usa los perfiles sugeridos por la IA o cualquier competidor de tu nicho. Analizar sus posts más comentados es la forma más rápida de encontrar prospectos calificados.</p>
                </div>
                {error && <div className="bg-yellow-500 text-black p-3 rounded-md mb-6 text-center">{error}</div>}
                <div className="mb-4">
                  <label htmlFor="profile" className="block mb-2 text-sm font-medium text-gray-300">Hashtag a buscar (sin #)</label>
                  <input type="text" id="profile" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} required placeholder="Ej: manicuristas" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5"/>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-lg disabled:bg-green-800">
                  {isLoading ? 'Analizando Perfil...' : '🔍 Buscar Posts Populares'}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Renderizado condicional: Muestra resultados si existen */}
        {foundPosts && foundPosts.length > 0 && (
          <div className="w-full">
            <button onClick={handleNewSearch} className="mb-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg">
              ← Nueva Búsqueda
            </button>
            <h2 className="text-2xl font-bold mb-6">Dossiers de Oportunidad:</h2>
            <div className="space-y-8">
              {foundPosts.map((post: any, index: number) => {
                const clean = (v: any) => (typeof v === 'string' && v.trim() && v.trim().toUpperCase() !== 'N/A' ? v.trim() : '');
                const username = clean(post?.ownerUsername) || clean(post?.username) || clean(post?.owner?.username);
                const fullName = clean(post?.ownerFullName) || clean(post?.owner?.full_name) || clean(post?.owner?.fullName);
                return (
                <div key={post?.id || index} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-700/50 flex items-center gap-4">
                    {post?.ownerProfilePicUrl && (
                      <Image src={post.ownerProfilePicUrl} alt={username || 'Avatar'} width={50} height={50} className="rounded-full" />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{fullName || username || 'Cuenta no disponible'}</h3>
                      {username && <p className="text-sm text-gray-400">@{username}</p>}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-300 mb-4 line-clamp-3">{post?.caption || "Sin descripción."}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-6">
                        <StatIcon>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                          {post?.likesCount?.toLocaleString() || 0}
                        </StatIcon>
                        <StatIcon>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M18 10c0 3.866-3.582 7-8 7a8.94 8.94 0 01-4.307-.982.5.5 0 00-.54.636A8.94 8.94 0 0010 17c4.418 0 8-3.134 8-7s-3.582-7-8-7a8.94 8.94 0 00-7.466 4.31a.5.5 0 00.866.5A7.94 7.94 0 0110 3c4.418 0 8 3.134 8 7zM4.5 9.5a.5.5 0 000-1 .5.5 0 000 1zm3 0a.5.5 0 000-1 .5.5 0 000 1zm3 0a.5.5 0 000-1 .5.5 0 000 1z" /></svg>
                          {post?.commentsCount?.toLocaleString() || 0}
                        </StatIcon>
                      </div>
                      <button onClick={() => handleAnalyzeUrl(post?.url)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        Analizar Oportunidad
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}