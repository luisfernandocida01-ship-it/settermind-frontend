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
}

interface PostContextDisplayProps {
  postDetails: PostDetails | null;
  profileAnalysis: ProfileAnalysis | null;
}

export function PostContextDisplay({ postDetails, profileAnalysis }: PostContextDisplayProps) {
  const username = postDetails?.ownerUsername || postDetails?.user?.username || 'Usuario no encontrado';
  const caption = postDetails?.caption || 'Descripción no disponible.';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Columna Izquierda: Contexto del Perfil (IA) */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white tracking-wide">Contexto del Perfil (IA)</h3>
        
        {profileAnalysis ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-400">Nicho Deducido:</p>
              <p className="text-sm text-slate-200 mt-0.5">{profileAnalysis.niche || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Avatar Deducido:</p>
              <p className="text-sm text-slate-200 mt-0.5">{profileAnalysis.avatar || 'No especificado'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No se pudo analizar el perfil.</p>
        )}
      </div>

      {/* Columna Derecha: Contexto del Post */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-bold text-white tracking-wide">Contexto del Post</h3>
        <p className="text-sm font-semibold text-sky-400">@{username}</p>
        <p className="text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto pr-2">
          "{caption}"
        </p>
      </div>
    </div>
  );
}