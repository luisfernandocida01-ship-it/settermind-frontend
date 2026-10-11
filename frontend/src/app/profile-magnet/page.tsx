// frontend/src/app/profile-magnet/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/useAuth';
import Link from 'next/link';
// Asumiremos que crearemos esta función en nuestro api.js
import { generateMagneticProfile, getAnalysisStatus } from '@/lib/api';
// --- Componente Principal ---
export default function ProfileMagnetPage() {
  const { logout } = useAuth();
  const router = useRouter();

  // Estado para el wizard y los datos
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    marca: '', avatar: '', promesa: '', metodo: '',
    prueba_social: '', oferta: '', categoria: '',
    ideas_highlights: '', enlace: ''
  });

  // Estado para los resultados y la carga
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('jwt_token')) {
      router.push('/login');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // 1. Inicia la tarea y obtén un ID de trabajo
      const initialResponse = await generateMagneticProfile(formData);
      const jobId = initialResponse.job_id;

      if (!jobId) {
        throw new Error("El backend no devolvió un ID para la tarea.");
      }

      // 2. Inicia el bucle de polling
      const intervalId = setInterval(async () => {
        try {
          const statusResponse = await getAnalysisStatus(jobId);

          if (statusResponse.status === 'completed') {
            clearInterval(intervalId);
            setResults(statusResponse.results);
            setIsLoading(false);
          } else if (statusResponse.status === 'failed') {
            clearInterval(intervalId);
            setError(statusResponse.results?.error || "La generación en el servidor falló.");
            setIsLoading(false);
          }
          // Si es 'pending' o 'processing', no hace nada y espera al siguiente ciclo
        } catch (pollErr) {
          clearInterval(intervalId);
          setError("Error de comunicación al verificar el estado de la tarea.");
          setIsLoading(false);
        }
      }, 5000); // Verifica cada 5 segundos

    } catch (err: any) {
      setError(err.message || "No se pudo iniciar la generación del perfil.");
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    // Simplificaremos a un solo paso por ahora para acelerar
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Paso 1: Define tu Marca</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block mb-1 text-sm">Tu Marca / Nombre</label>
                    <input name="marca" value={formData.marca} onChange={handleInputChange} className="bg-gray-700 w-full p-2.5 rounded-md" />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 text-sm">Tu Promesa (¿Qué logran?)</label>
                    <input name="promesa" value={formData.promesa} onChange={handleInputChange} className="bg-gray-700 w-full p-2.5 rounded-md" />
                </div>
            </div>
            <div className="mb-4">
                <label className="block mb-1 text-sm">Tu Cliente Ideal (Avatar)</label>
                <textarea name="avatar" value={formData.avatar} onChange={handleInputChange} rows={3} className="bg-gray-700 w-full p-2.5 rounded-md" />
            </div>
             <div className="mb-4">
                <label className="block mb-1 text-sm">Tu Oferta (Llamada a la Acción)</label>
                <input name="oferta" value={formData.oferta} onChange={handleInputChange} className="bg-gray-700 w-full p-2.5 rounded-md" placeholder="Ej: Agenda una llamada gratis"/>
            </div>
        </div>
    );
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-8">
        <div className="w-full max-w-4xl">
            <h1 className="text-4xl font-bold text-center mb-8">Asistente de Perfil Magnético</h1>
            
            {/* Si no hay resultados, muestra el wizard */}
            {!results && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Columna Izquierda: El Wizard */}
                    <div className="bg-gray-800 p-8 rounded-lg">
                        {renderStep()}
                        <div className="flex justify-end mt-8">
                            <button onClick={handleSubmit} disabled={isLoading} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-600">
                                {isLoading ? 'Generando...' : '✨ Generar Perfil'}
                            </button>
                        </div>
                    </div>

                    {/* Columna Derecha: Vista Previa */}
                    <div className="bg-gray-800 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">Vista Previa</h2>
                        <div className="bg-black border border-gray-700 rounded-lg p-4 font-mono text-sm">
                            <p className="font-bold">@{formData.marca || 'tunombredeusuario'}</p>
                            <p className="mt-2 whitespace-pre-wrap">{formData.promesa || 'Tu promesa principal aquí...'}</p>
                            <p className="mt-2 text-blue-400">{formData.oferta || '👇 Tu llamada a la acción'}</p>
                        </div>
                    </div>
                </div>
            )}

        {/* Sección de Resultados */}
        {results && (
          <div className="mt-12 bg-gray-800 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-center">¡Tu Perfil Magnético está Listo!</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Sugerencias de Nombre de Usuario:</h3>
                <div className="flex flex-wrap gap-2">{results.username_suggestions.map((name: string) => <span key={name} className="bg-gray-700 px-3 py-1 rounded-full text-sm">{name}</span>)}</div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Sugerencias de Nombre de Perfil (en negrita):</h3>
                <ul className="list-disc list-inside text-gray-300">{results.profile_name_suggestions.map((name: string) => <li key={name}>{name}</li>)}</ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Opciones de Biografía (¡Copia tu favorita!):</h3>
                <div className="space-y-4">
                  {results.bio_options.map((bio: string, index: number) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-md whitespace-pre-wrap">{bio}</div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Sugerencias de Highlights:</h3>
                <div className="flex flex-wrap gap-2">{results.highlight_suggestions.map((name: string) => <span key={name} className="bg-gray-700 px-3 py-1 rounded-full text-sm">{name}</span>)}</div>
          </div>
        </div>
      </div>
    )}
  </div> {/* Cierre del div className="w-full max-w-4xl" */}
</main>
);}