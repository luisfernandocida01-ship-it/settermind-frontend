// frontend/src/app/resources/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/useAuth';
import Link from 'next/link';

const URL_DEL_BACKEND = 'https://friendly-space-lamp-69xwwg95q9g7cqj-8001.app.github.dev'; // <-- RECUERDA REEMPLAZAR

export default function ResourcesPage() {
  const { logout } = useAuth();
  const router = useRouter();

  // Estados
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el formulario de nuevo recurso
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [resourceType, setResourceType] = useState('Webinar'); // Valor por defecto

  const fetchResources = async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('jwt_token');
    try {
      const response = await fetch(`${URL_DEL_BACKEND}/api/resources`, {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.detail || 'No se pudo cargar los recursos'); }
      setResources(data);
    } catch (err: any) { setError(err.message); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) { router.push('/login'); return; }
    fetchResources();
  }, [router]);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedToken = localStorage.getItem('jwt_token');
    try {
      const response = await fetch(`${URL_DEL_BACKEND}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${storedToken}` },
        body: JSON.stringify({ title, description, url, resource_type: resourceType }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'No se pudo añadir el recurso');
      }
      // Limpiamos el formulario y recargamos la lista
      setTitle(''); setDescription(''); setUrl('');
      fetchResources(); 
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    alert('¡Enlace copiado al portapapeles!');
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Columna Izquierda: Lista de Recursos */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-8">Portafolio de Recursos</h1>
          {isLoading ? (<p>Cargando...</p>)
           : error ? (<p className="text-red-500">{error}</p>)
           : resources.length === 0 ? (<p>Aún no tienes recursos. ¡Añade el primero!</p>)
           : (
            <div className="bg-gray-800 rounded-lg shadow-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-700"><tr><th className="p-4">Título</th><th className="p-4">Tipo</th><th className="p-4">Enlace</th><th className="p-4">Acción</th></tr></thead>
                <tbody>
                  {resources.map((res) => (
                    <tr key={res.id} className="border-b border-gray-700">
                      <td className="p-4">{res.title}</td>
                      <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full ${res.resource_type === 'CPL' ? 'bg-purple-600' : 'bg-green-600'}`}>{res.resource_type}</span></td>
                      <td className="p-4 truncate max-w-xs">{res.url}</td>
                      <td className="p-4"><button onClick={() => handleCopyUrl(res.url)} className="bg-blue-600 ...">Copiar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
           )}
        </div>
        
        {/* Columna Derecha: Añadir Nuevo Recurso */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Añadir Nuevo Recurso</h2>
          <form onSubmit={handleAddResource} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
            <div><label htmlFor="title">Título</label><input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-gray-700 ... w-full p-2.5 mt-1"/></div>
            <div><label htmlFor="url">URL (Enlace)</label><input id="url" type="text" value={url} onChange={(e) => setUrl(e.target.value)} required className="bg-gray-700 ... w-full p-2.5 mt-1"/></div>
            <div><label htmlFor="description">Descripción (Opcional)</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-gray-700 ... w-full p-2.5 mt-1"></textarea></div>
            <div><label htmlFor="resourceType">Tipo de Recurso</label><select id="resourceType" value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="bg-gray-700 ... w-full p-2.5 mt-1"><option>Webinar</option><option>CPL</option></select></div>
            <button type="submit" className="w-full bg-indigo-600 ...">Añadir al Portafolio</button>
          </form>
        </div>
      </div>
    </main>
  );
}