// frontend/src/components/LeadCard.tsx - VERSIÓN FINAL

'use client';

import { createConversation } from '@/lib/api';

interface Lead {
  comment_author?: string;
  username?: string;
  ownerUsername?: string;
  comment_text?: string;
  potential_score?: number | string;
  pain_point_identified?: string;
  suggested_openers?: string[];
}

export default function LeadCard({ lead }: { lead: Lead }) {
  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    alert("¡Opener copiado!");
  };

  const accountName = lead?.comment_author || lead?.username || lead?.ownerUsername || 'Usuario Anónimo';
  const hasScore = lead?.potential_score !== undefined && lead?.potential_score !== null && lead?.potential_score !== '';

  const handleStartTracking = async () => {
    try {
      await createConversation(lead);
      alert('¡Lead añadido a tu Bandeja de Conversaciones!');
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'No se pudo iniciar el seguimiento'}`);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <p className="font-bold text-lg text-white">{accountName}</p>
        <span className="bg-blue-600 text-blue-100 text-sm font-semibold px-3 py-1 rounded-full">
          {hasScore ? `Puntuación: ${lead.potential_score}/10` : `@${accountName.replace(/^@/, '')}`}
        </span>
      </div>
      
      <div>
        <blockquote className="bg-gray-700 p-4 rounded-md mb-4 border-l-4 border-gray-500">
          <p className="text-gray-300 italic">"{lead?.comment_text || 'Comentario no disponible.'}"</p>
        </blockquote>
        <div className="mb-4">
          <p className="font-semibold text-white">Dolor Identificado:</p>
          <p className="text-gray-400">{lead?.pain_point_identified || 'Análisis no disponible.'}</p>
        </div>
      </div>
        
      <div className="mt-6">
        <div className="mb-4">
          <p className="font-semibold text-white mb-2">Openers Sugeridos (Haz clic para copiar):</p>
          <ul className="space-y-3">
            {lead?.suggested_openers && Array.isArray(lead.suggested_openers) && lead.suggested_openers.map((opener: string, index: number) => (
              <li key={index} onClick={() => handleCopy(opener)} className="bg-gray-700 p-3 rounded-md cursor-pointer hover:bg-gray-600 transition">
                <p className="text-gray-300">{opener}</p>
              </li>
            ))}
          </ul>
        </div>
        
        <button 
          onClick={handleStartTracking}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded-lg text-sm mt-4"
        >
          Iniciar Seguimiento
        </button>
      </div>
    </div>
  );
}