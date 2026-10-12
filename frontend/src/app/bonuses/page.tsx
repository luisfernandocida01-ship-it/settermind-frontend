// frontend/src/app/bonuses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BonusesPage() {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const resources = [
    {
      id: 'guia-prospeccion',
      badge: 'Bono 1 • Guía Estratégica',
      title: 'Manual Maestro: Prospección Consultiva en Frío',
      description: 'Estructura paso a paso para iniciar conversaciones en Instagram sin parecer spam ni sonar invasivo.',
      tag: 'PDF / Guía',
      actionType: 'download',
      linkText: 'Descargar Manual (PDF)',
      url: '#',
    },
    {
      id: 'arsenal-scripts',
      badge: 'Bono 2 • Plantillas',
      title: 'Pack de 25 Guiones de Rompehielos & Seguimiento',
      description: 'Copys probados para romper el hielo a partir de historias, posts populares y encuestas en historias.',
      tag: 'Plantillas Copiables',
      actionType: 'copy',
      copyContent: 'Hola [Nombre], vi tu publicación sobre [Tema] y me llamó mucho la atención tu enfoque sobre [Punto clave]. ¿Cuánto tiempo llevas implementando esa metodología?',
      linkText: 'Copiar Script Principal',
    },
    {
      id: 'calculadora-metricas',
      badge: 'Bono 3 • Herramienta',
      title: 'Calculadora de Métricas del Setter',
      description: 'Determina cuántos mensajes, respuestas e interacciones diarias necesitas para cumplir tu meta de llamadas.',
      tag: 'Hoja de Cálculo',
      actionType: 'download',
      linkText: 'Abrir Hoja de Trabajo',
      url: '#',
    },
    {
      id: 'comunidad-soporte',
      badge: 'Exclusivo • Comunidad',
      title: 'Canal de Feedback & Casos de Estudio',
      description: 'Accede al canal privado donde analizamos capturas de pantalla de chats reales y resolvemos objeciones.',
      tag: 'Comunidad VIP',
      actionType: 'external',
      linkText: 'Unirme al Canal Privado →',
      url: '#',
    },
  ];

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2">
      {/* Encabezado */}
      <div className="border-b border-[#24334A] pb-6">
        <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
          Fase 3 • Gestión & Control
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Recursos, Plantillas & Bonos Exclusivos
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catálogo complementario con guías, plantillas de mensaje y activos para acelerar tus resultados como setter.
        </p>
      </div>

      {/* Grid de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {resources.map((item) => (
          <div
            key={item.id}
            className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition hover:border-sky-500/40"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  {item.badge}
                </span>
                <span className="bg-[#0B121E] text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-[#24334A]">
                  {item.tag}
                </span>
              </div>
              <h2 className="text-base font-bold text-white leading-snug">
                {item.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2">
              {item.actionType === 'copy' ? (
                <button
                  onClick={() => handleCopy(item.copyContent || '', item.id)}
                  className={`w-full text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 ${
                    copiedKey === item.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#1E293B] hover:bg-[#2A3B54] text-slate-200 border border-[#334155]'
                  }`}
                >
                  <span>📋</span>
                  <span>{copiedKey === item.id ? '✓ Guion Copiado' : item.linkText}</span>
                </button>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-sky-950/40 flex items-center justify-center space-x-2 text-center"
                >
                  <span>📥</span>
                  <span>{item.linkText}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}