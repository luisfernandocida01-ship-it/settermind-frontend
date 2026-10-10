// frontend/src/lib/api.js - VERSIÓN COMPLETA Y UNIFICADA
// lib/api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * Obtiene las cabeceras de autorización.
 * Prioriza la API Key de Hotmart (SaaS-20™) si existe, 
 * o el Bearer Token clásico almacenado en localStorage.
 */
function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    // 1. Detección automática de Magic Link (?key=...)
    const urlParams = new URLSearchParams(window.location.search);
    const keyFromUrl = urlParams.get("key");
    if (keyFromUrl) {
      localStorage.setItem("settermind_api_key", keyFromUrl);
    }

    // 2. Adjuntar API Key de Hotmart si está presente
    const apiKey = localStorage.getItem("settermind_api_key");
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    // 3. Adjuntar Token JWT estándar si el usuario inició sesión manualmente
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Función genérica para realizar peticiones HTTP a la API FastAPI
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "Error en la petición";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return response.json();
}

// --- Métodos de la API de SetterMind AI ---

export const api = {
  // Autenticación tradicional
  register: (data) =>
    fetchApi("/api/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    fetchApi("/api/login", { method: "POST", body: JSON.stringify(data) }),

  // Estrategia & Avatar
  getStrategies: () => fetchApi("/api/strategies"),
  generateStrategy: (data) =>
    fetchApi("/api/generate-strategy", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Radar de Prospectos & Scraping
  prospectPosts: (hashtag) =>
    fetchApi("/api/prospect", {
      method: "POST",
      body: JSON.stringify({ hashtag }),
    }),
  getPostDetails: (post_url) =>
    fetchApi("/api/get-post-details", {
      method: "POST",
      body: JSON.stringify({ post_url }),
    }),

  // Análisis de comentarios & Scoring IA
  analyzePost: (data) =>
    fetchApi("/api/analyze", { method: "POST", body: JSON.stringify(data) }),
  getAnalysis: (id) => fetchApi(`/api/analysis/${id}`),
  getHistory: () => fetchApi("/api/history"),

  // Bandeja de Salida (Outbox)
  getOutbox: () => fetchApi("/api/outbox"),
  addToOutbox: (data) =>
    fetchApi("/api/outbox", { method: "POST", body: JSON.stringify(data) }),
  markOutboxSent: (id) =>
    fetchApi(`/api/outbox/${id}/sent`, { method: "PATCH" }),

  // Pipeline de Conversaciones
  getConversations: () => fetchApi("/api/conversations"),
  createConversation: (data) =>
    fetchApi("/api/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateConversation: (id, data) =>
    fetchApi(`/api/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  exportConversation: (id) =>
    fetchApi(`/api/conversations/${id}/export`, { method: "POST" }),
};

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    console.warn("La variable de entorno NEXT_PUBLIC_API_URL no está definida. Usando URL de respaldo.");
    return 'http://localhost:8001'; // Ajusta si tu URL de respaldo es diferente
  }
  return url.replace(/\/+$/, '');
};

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt_token');
  }
  return null;
};

const apiFetch = async (endpoint, options = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  const token = getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorDetail = 'Ocurrió un error en la petición.';

    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.error || errorData.message || JSON.stringify(errorData);
      if (Array.isArray(errorDetail)) {
        // FastAPI 422: lista de errores de validación
        errorDetail = errorDetail.map((d) => `${(d.loc || []).slice(1).join('.')}: ${d.msg}`).join('; ');
      } else if (typeof errorDetail !== 'string') {
        errorDetail = JSON.stringify(errorDetail);
      }
    } catch (e) {
      errorDetail = response.statusText;
    }

    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
};

// --- Funciones de Autenticación ---
export const registerUser = (userData) => apiFetch('/api/register', { method: 'POST', body: JSON.stringify(userData) });
export const loginUser = (userData) => apiFetch('/api/login', { method: 'POST', body: JSON.stringify(userData) });


// --- Funciones de Prospección ---
export const generateStrategy = (strategyData) => apiFetch('/api/generate-strategy', { method: 'POST', body: JSON.stringify(strategyData) });
export const prospect = (searchParams) => apiFetch('/api/prospect', { method: 'POST', body: JSON.stringify(searchParams) });


// --- Funciones del Dashboard de Análisis ---
export const getPostDetails = (postUrl) => apiFetch('/api/get-post-details', { method: 'POST', body: JSON.stringify({ post_url: postUrl }) });
export const analyzeCongruence = (analysisData) => apiFetch('/api/analyze', { method: 'POST', body: JSON.stringify(analysisData) });
export const getAnalysisStatus = (analysisId) => apiFetch(`/api/analysis/${analysisId}`);

// --- ¡FUNCIÓN AÑADIDA! ---
// --- Funciones para la Bandeja de Conversaciones ---
export const getConversations = () => {
  return apiFetch('/api/conversations');
};

export const createConversation = (leadData) =>
  apiFetch('/api/conversations', { method: 'POST', body: JSON.stringify({ lead_data: leadData }) });

export const updateConversation = (convoId, updateData) => 
  apiFetch(`/api/conversations/${convoId}`, { method: 'PATCH', body: JSON.stringify(updateData) });

// --- Funciones para la Bandeja de Salida (Outbox) ---
export const addToOutbox = (payload) => apiFetch('/api/outbox', { method: 'POST', body: JSON.stringify(payload) }); // <-- ¡AÑADE ESTA LÍNEA!
export const getOutboxItems = () => apiFetch('/api/outbox');
export const markOutboxItemAsSent = (itemId) => apiFetch(`/api/outbox/${itemId}/sent`, { method: 'PATCH' });
// Reemplaza la función pushToCrm por esta:
export const exportLead = (convoId) => 
  apiFetch(`/api/conversations/${convoId}/export`, { method: 'POST' });
export const generateMagneticProfile = (profileData) => 
  apiFetch('/api/generate-profile-magnetic', { method: 'POST', body: JSON.stringify(profileData) });

export const generateContentIdeas = (data) => 
  apiFetch('/api/generate-content-ideas', { method: 'POST', body: JSON.stringify(data) });

export const generateContentResource = (data) => 
  apiFetch('/api/create-resource-lead-magnet', { method: 'POST', body: JSON.stringify(data) });

export const generateEngagementSequence = (data) => 
  apiFetch('/api/generate-engagement-sequence', { method: 'POST', body: JSON.stringify(data) });

export const generateHighlightsStoryboard = (data) => 
  apiFetch('/api/develop-highlights-storyboard', { method: 'POST', body: JSON.stringify(data) });
