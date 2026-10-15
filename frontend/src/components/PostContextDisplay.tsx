'use client';

interface PostDetails {
  ownerUsername?: string;
  user?: { username?: string };
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
}

interface ProfileAnalysis {
  niche?: string;
  avatar?: string;
  profesion?: string;
  profession?: string;
  objetivos?: string[];
  goals?: string[];
  puntos_de_dolor?: string[];
  pain_points?: string[];
}

interface PostContextDisplayProps {
  postDetails: PostDetails | null;
  profileAnalysis: ProfileAnalysis | null;
}

export function PostContextDisplay({ postDetails, profileAnalysis }: PostContextDisplayProps) {
  const username = postDetails?.ownerUsername || postDetails?.user?.username || 'usuario';
  const caption = postDetails?.caption || 'Descripción no disponible.';

  const profession = profileAnalysis?.profesion || profileAnalysis?.profession;
  const objetivos = profileAnalysis?.objetivos || profileAnalysis?.goals || [];
  const puntosDeDolor = profileAnalysis?.puntos_de_dolor || profileAnalysis?.pain_points || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Columna Izquierda: Contexto del Perfil (IA) */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white tracking-wide">Contexto del Perfil (IA)</h3>

        {profileAnalysis ? (
          <div className="space-y-4 text-xs">
            {/* Nicho */}
            <div>
              <p className="font-semibold text-slate-400">Nicho Deducido:</p>
              <p className="text-slate-200 mt-0.5 leading-relaxed">{profileAnalysis.niche || 'No especificado'}</p>
            </div>

            {/* Avatar */}
            <div>
              <p className="font-semibold text-slate-400">Avatar Deducido:</p>
              <p className="text-slate-200 mt-0.5 leading-relaxed">{profileAnalysis.avatar || 'No especificado'}</p>
              
              {profession && (
                <p className="text-slate-300 mt-2">
                  <span className="font-semibold text-sky-400">Profesión:</span> {profession}
                </p>
              )}

              {objetivos.length > 0 && (
                <div className="mt-2 space-y-1">
                  <span className="font-semibold text-sky-400 block">Objetivos:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    {objetivos.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Puntos de dolor */}
            {puntosDeDolor.length > 0 && (
              <div>
                <p className="font-semibold text-amber-400 mb-1">Puntos de Dolor:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                  {puntosDeDolor.map((dolor, i) => (
                    <li key={i}>{dolor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No se pudo analizar el perfil.</p>
        )}
      </div>

      {/* Columna Derecha: Contexto del Post */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-bold text-white tracking-wide">Contexto del Post</h3>
        <p className="text-sm font-semibold text-sky-400">@{username}</p>
        <div className="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-2 bg-[#0B121E] p-3.5 rounded-xl border border-[#24334A]">
          "{caption}"
        </div>
      </div>
    </div>
  );
}
