'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function StrategiesPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) {
      router.push('/login');
      return;
    }

    const fetchStrategies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/strategies`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || data.detail || 'No se pudieron cargar las estrategias');
        }

        setStrategies(Array.isArray(data.strategies) ? data.strategies : Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Error al conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, [router]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Estrategia & Avatar</h1>
        <p className="text-sm text-gray-400 mt-1">
          FASE 1 • Define los ángulos de prospección y criterios de avatar consultivo
        </p>
      </div>

      {isLoading ? (
        <p className="text-gray-400">Cargando estrategias configuradas...</p>
      ) : error ? (
        <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-lg text-sm">
          {error}
        </div>
      ) : strategies.length === 0 ? (
        <div className="bg-[#111A28] border border-[#1E2D42] rounded-xl p-8 text-center">
          <p className="text-gray-300 text-base font-medium">Aún no tienes estrategias registradas.</p>
          <p className="text-gray-500 text-xs mt-1">Configura tu primer avatar para comenzar a calificar prospectos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map((item, idx) => (
            <div key={item.id || idx} className="bg-[#111A28] border border-[#1E2D42] rounded-xl p-5">
              <h3 className="text-white font-semibold text-base mb-2">{item.title || item.name || `Estrategia #${idx + 1}`}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{item.description || item.content || 'Sin detalles'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}