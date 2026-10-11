// frontend/src/app/content-factory/page.tsx
'use client';

import { useState } from 'react';

export default function ContentFactoryPage() {
  const [activeTab, setActiveTab] = useState<'highlights' | 'spark' | 'arsenal' | 'engagement'>('highlights');

  // Estados originales de cada herramienta
  const [name, setName] = useState('');
  const [mission, setMission] = useState('');
  const [methodName, setMethodName] = useState('');
  const [resultExample, setResultExample] = useState('');

  const [sparkTopic, setSparkTopic] = useState('');
  const [arsenalResource, setArsenalResource] = useState('');
  const [engagementQuestion, setEngagementQuestion] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const tabs = [
    { id: 'highlights', label: 'Director de Highlights' },
    { id: 'spark', label: 'Chispa Creativa' },
    { id: 'arsenal', label: 'Arsenal de Recursos' },
    { id: 'engagement', label: 'Laboratorio de Engagement' },
  ] as const;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2">
      {/* Título y Fase */}
      <div className="text-center space-y-2">
        <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20">
          Fase 2 • Contenidos de Autoridad
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Fábrica de Contenidos</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Genera activos de contenido magnético para tus historias, historias destacadas y publicaciones.
        </p>
      </div>

      {/* Navegación por Pestañas (Submenú con buen contraste) */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-[#24334A] pb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40'
                  : 'bg-[#162032] text-slate-300 hover:bg-[#1E293B] hover:text-white border border-[#24334A]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenedor Principal de la Pestaña Activa */}
      <div className="bg-[#162032] border border-[#24334A] rounded-2xl p-7 md:p-8 shadow-xl">
{/* PESTAÑA 1: Director de Highlights */}
        {activeTab === 'highlights' && (
          <div className="space-y-6">
            <div className="border-b border-[#24334A] pb-4">
              <span className="inline-block bg-sky-500/10 text-sky-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
                Herramienta 1
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Director de Highlights (Historias Destacadas)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Estructura las historias destacadas de tu perfil para transmitir autoridad, misión y prueba social en segundos.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tu Nombre o Marca
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Luis Fernando"
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tu Misión / Tu &quot;Por qué&quot;
                </label>
                <textarea
                  rows={3}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="Ej: Ayudar a personas a iniciarse como Setters de alta cualificación sin depender de anuncios caros..."
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nombre de tu Método / Sistema
                </label>
                <input
                  type="text"
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  placeholder="Ej: Método Setter Consultivo 3 Fases"
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Un ejemplo de resultado de cliente o caso de éxito
                </label>
                <input
                  type="text"
                  value={resultExample}
                  onChange={(e) => setResultExample(e.target.value)}
                  placeholder="Ej: Alumno cerró 4 llamadas cualificadas en su primera semana..."
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <button
                type="button"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>🎬</span>
                <span>Generar Guion de Highlights con IA</span>
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: Chispa Creativa */}
        {activeTab === 'spark' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white tracking-tight border-b border-[#24334A] pb-3">
              Chispa Creativa (Ideas de Contenido Diario)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tema o Pilar de Contenido
                </label>
                <input
                  type="text"
                  value={sparkTopic}
                  onChange={(e) => setSparkTopic(e.target.value)}
                  placeholder="Ej: Objeciones comunes, errores al prospectar, cómo iniciar sin experiencia..."
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
              <button
                type="button"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 cursor-pointer"
              >
                Encender Chispa Creativa
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: Arsenal de Recursos */}
        {activeTab === 'arsenal' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white tracking-tight border-b border-[#24334A] pb-3">
              Arsenal de Recursos (Lead Magnets & Entregables)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tipo de Recurso que deseas crear
                </label>
                <input
                  type="text"
                  value={arsenalResource}
                  onChange={(e) => setArsenalResource(e.target.value)}
                  placeholder="Ej: Plantilla de mensajes, Check-list de prospección, Calculadora..."
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
              <button
                type="button"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 cursor-pointer"
              >
                Estructurar Recurso de Alto Valor
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: Laboratorio de Engagement */}
        {activeTab === 'engagement' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white tracking-tight border-b border-[#24334A] pb-3">
              Laboratorio de Engagement (Encuestas & Stickers)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pregunta o Conversación que quieres abrir
                </label>
                <input
                  type="text"
                  value={engagementQuestion}
                  onChange={(e) => setEngagementQuestion(e.target.value)}
                  placeholder="Ej: ¿Qué te frena hoy para prospectar clientes en frío?"
                  className="w-full bg-[#0B121E] border border-[#24334A] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
              <button
                type="button"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-lg shadow-sky-950/40 cursor-pointer"
              >
                Generar Dinámica de Conversación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}