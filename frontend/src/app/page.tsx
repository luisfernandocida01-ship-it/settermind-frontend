'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth';
import { PostContextDisplay } from '@/components/PostContextDisplay';
import OpportunityFilter from '@/components/OpportunityFilter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';

export default function Dashboard() {
  const { logout } = useAuth();
  const router = useRouter();

  const [postUrl, setPostUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [postDetails, setPostDetails] = useState<any>(null);
  const [profileAnalysis, setProfileAnalysis] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const pendingUrl = localStorage.getItem('url_to_analyze');
    if (pendingUrl) {
      setPostUrl(pendingUrl);
      localStorage.removeItem('url_to_analyze');
    }
  }, [router]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ post_url: postUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Error al analizar la publicación');
      }

      setPostDetails(data.post_details || data);
      setProfileAnalysis(data.profile_analysis || null);
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setPostDetails(null);
    setProfileAnalysis(null);
    setComments([]);
    setPostUrl('');
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Paso 1: Input URL */}
      {step === 1 && (
        <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
              Paso 1
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Pega la URL del Post</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Ingresa el enlace de Instagram para extraer comentarios y cualificar oportunidades.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-amber-950/40 border border-amber-700/60 text-amber-300 p-3 rounded-xl text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <input
                type="url"
                required
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isAnalyzing ? 'Procesando post...' : 'Siguiente Paso →'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Paso 2: Visualización de Contexto */}
      {step === 2 && postDetails && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20">
              Paso 2: Análisis del Post
            </span>
            <button
              onClick={handleReset}
              className="bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-bold py-2 px-4 rounded-xl transition border border-[#334155]"
            >
              ← Analizar otro post
            </button>
          </div>

          <PostContextDisplay postDetails={postDetails} profileAnalysis={profileAnalysis} />

          {comments.length > 0 && (
            <OpportunityFilter comments={comments} postDetails={postDetails} />
          )}
        </div>
      )}
    </div>
  );
}