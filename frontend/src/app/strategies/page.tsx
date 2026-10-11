// frontend/src/app/strategies/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function StrategiesPage() {
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

        if (response.status === 401 || response.status === 404) {
          // Si el token es inválido o no existe el usuario en la BD, limpiar y renovar sesión
          const data = await response.json();
          setError(data.error || data.detail || 'Sesión expirada o usuario no encontrado. Inicia sesión nuevamente.');
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || data.detail || 'No se pudieron cargar las estrategias');
        }

        setStrategies(Array.isArray(data.strategies) ? data.strategies : Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Error de conexión');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, [router]);

  return (
    <div className="p-8 max-w-5xl mx-auto text-slate-100">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Estrategia & Avatar</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
          FASE 1 • Define los ángulos de prospección y criterios de avatar consultivo
        </p>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Cargando estrategias...</p>
      ) : error ? (
        <div className="bg-[#1C1318] border border-red-800/60 text-red-300 p-4 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => router.push('/login')}
            className="ml-4 bg-red-800/40 hover:bg-red-700/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition"
          >
            Reconectar
          </button>
        </div>
      ) : strategies.length === 0 ? (
        <div className="bg-[#111A28] border border-[#1E2D42] rounded-xl p-8 text-center mt-4">
          <p className="text-gray-200 text-base font-semibold">Aún no tienes estrategias registradas.</p>
          <p className="text-gray-400 text-xs mt-1">
            Dirígete a <strong className="text-sky-400">Radar de Prospectos</strong> para generar tu primera campaña con IA.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {strategies.map((item, idx) => (
            <div key={item.id || idx} className="bg-[#111A28] border border-[#1E2D42] rounded-xl p-5">
              <h3 className="text-white font-bold text-base mb-1">{item.title || item.name || `Estrategia #${idx + 1}`}</h3>
              <p className="text-gray-300 text-xs leading-relaxed">{item.description || item.content || 'Sin descripción'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}