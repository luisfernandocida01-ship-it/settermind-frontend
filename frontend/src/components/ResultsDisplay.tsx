// frontend/src/components/ResultsDisplay.tsx - VERSIÓN FINAL Y COMPLETA (CON PROTECCIÓN)

'use client';

import { useState } from 'react';
import { addToOutbox } from '@/lib/api'; 

// Tipamos los props para mayor claridad y seguridad
interface Lead {
  usuario: string;
  comentario: string;
  dolor_identificado: string;
  puntuacion: string;
  openers_sugeridos?: string[]; // <-- Hacemos que la propiedad sea opcional
}

interface ResultsDisplayProps {
  results: {
    summary: string;
    leads: any[];
  };
  onReset: () => void;
  postUrl: string; 
}

// El backend puede enviar las claves en español o en inglés.
const normalizeLead = (raw: any): Lead => ({
  usuario: raw?.usuario ?? raw?.comment_author ?? raw?.username ?? '',
  comentario: raw?.comentario ?? raw?.comment_text ?? raw?.comment ?? '',
  dolor_identificado: raw?.dolor_identificado ?? raw?.pain_point_identified ?? raw?.pain_point ?? '',
  puntuacion: String(raw?.puntuacion ?? raw?.potential_score ?? raw?.score ?? ''),
  openers_sugeridos: raw?.openers_sugeridos ?? raw?.suggested_openers ?? [],
});

export default function ResultsDisplay({ results, onReset, postUrl }: ResultsDisplayProps) {
  const [queuedStatus, setQueuedStatus] = useState<Record<string, boolean>>({});

  const handleAddToQueue = async (lead: Lead, opener: string) => {
    const queueKey = lead.comentario + opener;
    try {
      const payload = {
        post_url: postUrl,
        prospect_username: lead.usuario || 'Usuario Anónimo',
        prospect_comment: lead.comentario,
        identified_pain: lead.dolor_identificado,
        score: String(lead.puntuacion || ''), // Convierte a string. Si es undefined, envía un string vacío.
        selected_opener: opener,
      };
  
      await addToOutbox(payload);
      setQueuedStatus(prev => ({ ...prev, [queueKey]: true }));
    } catch (error: any) {
      console.error("Error al añadir a la cola:", error);
      alert(`No se pudo añadir el opener a la bandeja de salida:\n\n${error.message}`);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <button onClick={onReset} className="mb-8 text-blue-400 hover:text-blue-300">
        &larr; Analizar otro Post
      </button>

      <h1 className="text-4xl font-bold text-center mb-4">Análisis de Resultados</h1>
      <p className="text-gray-400 text-center mb-12">
        {results.summary}
      </p>

      <div className="space-y-12">
        {results.leads && results.leads.map((rawLead, leadIndex) => {
          const lead = normalizeLead(rawLead);
          return (
          <div key={leadIndex} className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">{lead.usuario || 'Usuario Anónimo'}</h3>
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Puntuación: {lead.puntuacion}
              </span>
            </div>

            <blockquote className="border-l-4 border-gray-500 pl-4 mb-4">
              <p className="text-gray-300 italic">"{lead.comentario}"</p>
            </blockquote>

            <div className="mb-6">
              <h4 className="font-bold text-gray-400 mb-2">Dolor Identificado:</h4>
              <p className="text-gray-200">{lead.dolor_identificado}</p>
            </div>

            <div>
              <h4 className="font-bold text-gray-400 mb-3">Openers Sugeridos (Haz clic para añadir a la bandeja de salida):</h4>
              <div className="space-y-2">
                {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE! --- */}
                {/* Comprobamos si openers_sugeridos existe y es un array antes de mapearlo */}
                {lead.openers_sugeridos && lead.openers_sugeridos.map((opener, openerIndex) => {
                  const queueKey = lead.comentario + opener;
                  const isQueued = queuedStatus[queueKey];
                  return (
                    <button
                      key={openerIndex}
                      onClick={() => handleAddToQueue(lead, opener)}
                      disabled={isQueued}
                      className={`w-full p-4 text-left rounded-lg transition-colors text-sm ${
                        isQueued
                          ? 'bg-green-900/50 text-gray-500 cursor-not-allowed ring-1 ring-green-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {isQueued ? '✓ Añadido a la Bandeja de Salida' : opener}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}