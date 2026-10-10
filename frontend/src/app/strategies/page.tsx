// frontend/src/app/strategies/page.tsx

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/useAuth';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com'; // <-- RECUERDA REEMPLAZAR

export default function StrategiesPage() {
  const { logout } = useAuth();
  const router = useRouter();frontend/src/components/Sidebar.tsx
  const [strategies, setStrategies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) { router.push('/login'); return; }

    const fetchStrategies = async () => {
      try {
        const response = await fetch(`${URL_DEL_BACKEND}/api/strategies`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.detail || 'No se pudo cargar el historial'); }
        setStrategies(data);
      } catch (err: any) { setError(err.message); } 
      finally { setIsLoading(false); }
    };
    fetchStrategies();
  }, [router]);

const useStrategy = (strategy: any) => {
  // Tomamos el PRIMER hashtag de la lista
  const firstHashtag = strategy.hashtags[0] || '';
  // Lo limpiamos de cualquier # que pueda tener
  const cleanedHashtag = firstHashtag.replace(/#/g, '');

  // Guardamos el hashtag limpio
  localStorage.setItem('hashtag_to_prospect', cleanedHashtag);
  
  router.push('/prospect');
};

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-8">
      <nav className="w-full max-w-5xl mb-12 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-3xl font-bold">SetterMind AI</h1>
          <Link href="/" className="text-gray-300 hover:text-white">Dashboard</Link>
          <Link href="/conversations" className="text-white font-bold">Bandeja</Link>
          <Link href="/prospect" className="text-gray-300 hover:text-white">Prospectar</Link>
          <Link href="/history" className="text-gray-300 hover:text-white">Historial</Link>
          <Link href="/strategies" className="text-white font-bold">Estrategias</Link>
          <Link href="/profile-magnet" className="text-gray-300 hover:text-white">Perfil Magnético</Link>
          <Link href="/content-factory" className="text-gray-300 hover:text-white">Fábrica de Contenidos</Link>
          <Link href="/resources" className="text-gray-300 hover:text-white">Portafolio</Link>
        </div>
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 ...">Cerrar Sesión</button>
      </nav>
      <div className="w-full max-w-6xl"> {/* Más ancho para la tabla */}
        <h1 className="text-4xl font-bold text-center mb-12">Cuaderno de Estrategias</h1>
        {isLoading ? (<p>Cargando...</p>) 
         : error ? (<p>{error}</p>) 
         : strategies.length === 0 ? (<p>Aún no has generado ninguna estrategia.</p>) 
         : (
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <table className="w-full text-left">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4">Nicho / Producto</th>
                  <th className="p-4">Hashtags Sugeridos</th>
                  <th className="p-4">Palabras Clave Sugeridas</th>
                  <th className="p-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((strategy) => (
                  <tr key={strategy.id} className="border-b border-gray-700">
                    <td className="p-4 align-top w-1/4">{strategy.niche}</td>
                    <td className="p-4 align-top w-1/4">
                      {strategy.hashtags.map((tag: string) => `#${tag}`).join(', ')}
                    </td>
                    <td className="p-4 align-top w-1/4">
                      {strategy.keywords.join(', ')}
                    </td>
                    <td className="p-4 align-top">
                      <button onClick={() => useStrategy(strategy)} className="bg-blue-600 hover:bg-blue-700 ...">
                        Usar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}