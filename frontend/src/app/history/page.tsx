// frontend/src/app/history/page.tsx - VERSIÓN CORREGIDA PARA PRODUCCIÓN

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatInTimeZone } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { useAuth } from '@/components/useAuth';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function HistoryPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) {
      router.push('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || data.detail || 'No se pudo cargar el historial');
        }

        setHistory(Array.isArray(data.history) ? data.history : Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Error al conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-12">Historial de Análisis</h1>
        {isLoading ? (
          <p className="text-center text-gray-400">Cargando tu historial...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : history.length === 0 ? (
          <p className="text-center text-gray-400">Aún no has realizado ningún análisis.</p>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-200">
                <tr>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">URL Analizada</th>
                  <th className="p-4">Resumen</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-4 whitespace-nowrap text-sm text-gray-300">
                      {item.created_at ? (() => {
                        try {
                          return formatInTimeZone(parseISO(item.created_at), 'America/Mexico_City', 'dd/MM/yyyy, HH:mm');
                        } catch {
                          return new Date(item.created_at).toLocaleString();
                        }
                      })() : '—'}
                    </td>
                    <td className="p-4 truncate max-w-xs text-sm text-cyan-400">{item.post_url || '—'}</td>
                    <td className="p-4 text-gray-300 text-sm">{item.summary || item.result || 'Sin resumen'}</td>
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