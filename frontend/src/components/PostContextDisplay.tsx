// frontend/src/components/PostContextDisplay.tsx - VERSIÓN FINAL QUE MANEJA OBJETOS COMPLEJOS

'use client';
import { useState } from 'react';

// --- NUEVA INTERFAZ PARA EL NICHO ---
interface Niche {
  mercado_principal?: string;
  sub_nicho?: string;
  micro_nicho?: string;
}

interface Avatar {
  profesion?: string;
  nivel_experiencia?: string;
  objetivos?: string[];
  puntos_de_dolor?: string[];
}

interface PostDetails {
  user?: { username?: string };
  caption?: string;
}

interface ProfileAnalysis {
  niche?: string | Niche; // El nicho puede ser string u objeto
  avatar?: string | Avatar; // El avatar puede ser string u objeto
}

interface PostContextProps {
  postDetails: PostDetails | null;
  profileAnalysis: ProfileAnalysis | null;
  onAnalyze: (context: { niche: string, avatar: string }) => void;
  onReset: () => void;
  isLoading: boolean;
}

// --- NUEVO HELPER PARA MOSTRAR EL NICHO ---
const NicheDetails = ({ niche }: { niche: Niche }) => (
  <div className="text-gray-400 text-sm space-y-1">
    {niche.mercado_principal && <p><span className="font-semibold text-gray-300">Mercado:</span> {niche.mercado_principal}</p>}
    {niche.sub_nicho && <p><span className="font-semibold text-gray-300">Sub-nicho:</span> {niche.sub_nicho}</p>}
    {niche.micro_nicho && <p><span className="font-semibold text-gray-300">Micro-nicho:</span> {niche.micro_nicho}</p>}
  </div>
);

const AvatarDetails = ({ avatar }: { avatar: Avatar }) => (
  <div className="text-gray-400 text-sm">
    {avatar.profesion && <p className="mb-1"><span className="font-semibold text-gray-300">Profesión:</span> {avatar.profesion}</p>}
    {avatar.nivel_experiencia && <p className="mb-2"><span className="font-semibold text-gray-300">Experiencia:</span> {avatar.nivel_experiencia}</p>}
    {avatar.objetivos && (
      <div className="mb-2">
        <p className="font-semibold text-gray-300">Objetivos:</p>
        <ul className="list-disc list-inside">
          {avatar.objetivos.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>
    )}
    {avatar.puntos_de_dolor && (
      <div>
        <p className="font-semibold text-gray-300">Puntos de Dolor:</p>
        <ul className="list-disc list-inside">
          {avatar.puntos_de_dolor.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>
    )}
  </div>
);

export function PostContextDisplay({ postDetails, profileAnalysis, onAnalyze, onReset, isLoading }: PostContextProps) {
  const [niche, setNiche] = useState('');
  const [avatar, setAvatar] = useState('');

  const handleAnalysisClick = () => { onAnalyze({ niche, avatar }); };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <button onClick={onReset} className="text-blue-400 hover:text-blue-300">&larr; Usar otra URL</button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Contexto del Perfil (IA)</h2>
            {profileAnalysis?.niche ? (
              <>
                <p className="font-semibold text-sm text-gray-300">Nicho Deducido:</p>
                <div className="mb-3">
                  {/* --- ¡AQUÍ LA CORRECCIÓN PARA EL NICHO! --- */}
                  {typeof profileAnalysis.niche === 'string' ? (
                    <p className="text-gray-400">{profileAnalysis.niche}</p>
                  ) : (
                    profileAnalysis.niche && <NicheDetails niche={profileAnalysis.niche} />
                  )}
                </div>

                <p className="font-semibold text-sm text-gray-300">Avatar Deducido:</p>
                <div>
                  {typeof profileAnalysis.avatar === 'string' ? (
                    <p className="text-gray-400">{profileAnalysis.avatar}</p>
                  ) : (
                    profileAnalysis.avatar && <AvatarDetails avatar={profileAnalysis.avatar} />
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-500 italic">No se pudo analizar el perfil.</p>
            )}
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Contexto del Post</h2>
            <p className="text-gray-400 text-sm mb-4">@{postDetails?.user?.username || 'Usuario no encontrado'}</p>
            <p className="text-gray-300 italic line-clamp-4">"{postDetails?.caption || 'Descripción no disponible.'}"</p>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Contexto de Tu Producto</h2>
          {/* ... formulario ... */}
          <div className="mb-4">
            <label htmlFor="niche">Tu Nicho / Producto</label>
            <input type="text" id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg w-full p-2.5 mt-1" />
          </div>
          <div>
            <label htmlFor="avatar">Tu Cliente Ideal (Avatar)</label>
            <textarea id="avatar" rows={5} value={avatar} onChange={(e) => setAvatar(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg w-full p-2.5 mt-1"></textarea>
          </div>
        </div>
      </div>
      
      <button onClick={handleAnalysisClick} disabled={isLoading || !niche || !avatar} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg">
        {isLoading ? 'Analizando...' : '🧠 Analizar Congruencia y Comentarios'}
      </button>
    </div>
  );
}