// frontend/src/app/page.tsx - ¡VERSIÓN CON RUTAS CORREGIDAS!

'use client';
import { useState, useEffect, useReducer } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/useAuth'; // Corregido también por consistencia
import { getPostDetails, analyzeCongruence, getAnalysisStatus } from '@/lib/api'; // APIs del helper
import { PostContextDisplay } from '@/components/PostContextDisplay'; // Componente extraído
import ResultsDisplay from '@/components/ResultsDisplay'; // Asumo que ya es un componente
import { Spinner } from '@/components/Spinner'; // Componente de Spinner

// --- El resto del código se mantiene exactamente igual ---

// 1. Definir el estado y las acciones para useReducer
const initialState = {
  step: 1, // 1: Form, 2: Context, 3: Results
  postUrl: '',
  postDetails: null,
  profileAnalysis: null,
  finalResults: null,
  isLoading: false,
  error: null,
};

// En frontend/src/app/page.tsx

function analysisReducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'FETCH_DETAILS_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_DETAILS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        step: 2,
        postDetails: action.payload.post,
        profileAnalysis: action.payload.profile,
      };
    case 'FETCH_FAILURE':
      // Volvemos al paso 1 si algo falla gravemente y mostramos el error
      return { ...initialState, error: action.payload };
    
    // --- ¡ESTE ES EL CASO QUE FALTABA! ---
    case 'ANALYZE_START_POLLING':
      // Esta acción nos mueve a la pantalla de "Cargando..."
      return { ...state, isLoading: true, error: null, step: 2.5 }; 

    case 'ANALYZE_SUCCESS':
      // Esta acción se llama cuando el polling termina con éxito
      return { ...state, isLoading: false, step: 3, finalResults: action.payload };
    
    case 'RESET':
      return initialState;
    default:
      // Si llega aquí, es porque despachamos una acción que el reducer no conoce
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}

// 2. Componente Dashboard que utiliza el reducer
function Dashboard({ logout }: { logout: () => void }) {
  const [state, dispatch] = useReducer(analysisReducer, initialState);
  const { step, postUrl, postDetails, profileAnalysis, finalResults, isLoading, error } = state;

  const resetAll = () => dispatch({ type: 'RESET' });

  useEffect(() => {
    const urlToAnalyze = localStorage.getItem('url_to_analyze');
    if (urlToAnalyze) {
      dispatch({ type: 'SET_FIELD', field: 'postUrl', value: urlToAnalyze });
      localStorage.removeItem('url_to_analyze');
    }
  }, []);

  const handleFetchDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl.trim()) {
      dispatch({ type: 'FETCH_FAILURE', payload: "Por favor, pega una URL." });
      return;
    }
    dispatch({ type: 'FETCH_DETAILS_START' });
    try {
      const data = await getPostDetails(postUrl);
      dispatch({ type: 'FETCH_DETAILS_SUCCESS', payload: data });
    } catch (err: any) {
      dispatch({ type: 'FETCH_FAILURE', payload: err.message });
    }
  };

const handleFinalAnalysis = async (context: { niche: string, avatar: string }) => {
  console.log('[DEBUG] 1. Botón "Analizar" presionado. Iniciando análisis.');
  dispatch({ type: 'ANALYZE_START_POLLING' });

  try {
    const initialResponse = await analyzeCongruence({ post_url: postUrl, ...context });
    const analysisId = initialResponse.analysis_id;
    console.log(`[DEBUG] 2. Backend respondió. Tarea iniciada con ID: ${analysisId}`);

    if (!analysisId) {
      throw new Error("El backend no devolvió un ID de análisis. La tarea no pudo comenzar.");
    }

    const intervalId = setInterval(async () => {
      try {
        console.log(`[DEBUG] 3. Verificando estado para el ID: ${analysisId}`);
        const statusResponse = await getAnalysisStatus(analysisId);
        console.log('[DEBUG] 4. Backend respondió al chequeo de estado:', statusResponse);

        if (statusResponse.status === 'completed') {
          console.log('[DEBUG] 5. ¡ÉXITO! El estado es "completed". Deteniendo el bucle.');
          clearInterval(intervalId);
          dispatch({ type: 'ANALYZE_SUCCESS', payload: statusResponse.results ?? statusResponse });
        } else if (statusResponse.status === 'failed') {
          console.error('[DEBUG] 6. ¡FALLO! El backend reportó un error:', statusResponse.results?.error);
          clearInterval(intervalId);
          const errorMessage = statusResponse.results?.error || 'El análisis en el servidor falló.';
          dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
        } else {
          console.log(`[DEBUG] -> El estado es '${statusResponse.status}'. Esperando 5 segundos...`);
        }
      } catch (pollErr) {
        console.error('[DEBUG] 6. Error CRÍTICO durante el polling:', pollErr);
        clearInterval(intervalId);
        dispatch({ type: 'FETCH_FAILURE', payload: 'No se pudo comunicar con el servidor para verificar el estado.' });
      }
    }, 5000); // <-- LA CORRECCIÓN ESTÁ AQUÍ. ASEGÚRATE DE QUE EL ')' ESTÉ PRESENTE.

  } catch (initialErr: any) {
    console.error('[DEBUG] 6. Error CRÍTICO al iniciar la tarea:', initialErr);
    dispatch({ type: 'FETCH_FAILURE', payload: `Error al iniciar el análisis: ${initialErr.message}` });
  }
};
  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-8">

      {step === 1 && (
<div className="w-full max-w-2xl mx-auto py-10">
  <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-8 shadow-2xl">
    <div className="text-center mb-6">
      <span className="inline-block bg-sky-500/10 text-sky-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-3">
        Flujo de Cualificación
      </span>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        Paso 1: Pega la URL del Post
      </h1>
      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
        Ingresa el enlace de Instagram o red social del contenido que deseas analizar para extraer prospectos calificados.
      </p>
    </div>

    <form onSubmit={handleUrlSubmit} className="space-y-4">
      <div>
        <input
          type="url"
          required
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          placeholder="https://www.instagram.com/p/..."
          className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition"
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
</div>

      {step === 2 && postDetails && (
        <PostContextDisplay
          postDetails={postDetails}
          profileAnalysis={profileAnalysis}
          onAnalyze={handleFinalAnalysis}
          onReset={resetAll}
          isLoading={isLoading}
        />
      )}

      {step === 3 && finalResults && (
        <ResultsDisplay results={finalResults} onReset={resetAll} postUrl={postUrl} />
      )}
    </main>
  );
}

// 3. Componente de Página principal (Wrapper de autenticación)
export default function HomePage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('jwt_token')) {
      router.push('/login');
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) {
    return (
      <main className="bg-gray-900 min-h-screen flex items-center justify-center">
        <p>Verificando sesión...</p>
      </main>
    );
  }

  return <Dashboard logout={logout} />;
}