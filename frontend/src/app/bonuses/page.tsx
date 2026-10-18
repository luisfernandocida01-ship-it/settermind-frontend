'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BonusItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  tag: string;
  actionType: 'modal' | 'copy' | 'external';
  linkText: string;
  url?: string;
  modalContent?: string;
  copyContent?: string;
}

export default function BonusesPage() {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<BonusItem | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const resources: BonusItem[] = [
    {
      id: 'guia-prospeccion',
      badge: 'Bono 1 • Guía Estratégica',
      title: 'Manual Maestro: Prospección Consultiva en Frío',
      description: 'Estructura táctica paso a paso para iniciar conversaciones en Instagram sin parecer spam ni sonar invasivo.',
      tag: 'Manual Operativo',
      actionType: 'modal',
      linkText: 'Ver Manual Completo',
      modalContent: `MANUAL MAESTRO: PROSPECCIÓN CONSULTIVA EN FRÍO
==================================================

1. PRINCIPIO DE NO INVASIÓN
Nunca lances una oferta o enlace en los primeros 3 mensajes. El objetivo inicial no es vender la solución, sino vender la conversación.

2. PROTOCOLO DE CONEXIÓN EN 4 TIEMPOS:
- Paso 1 (Contexto / Pie de Foto): Menciona un elemento específico de su perfil o historia reciente.
- Paso 2 (Validación Empática): Reconoce su esfuerzo o enfoque en el sector.
- Paso 3 (La Pregunta de Quiebre): "¿Cuánto tiempo llevas aplicando este método con clientes?" o "¿Cómo estás manejando actualmente la captación?"
- Paso 4 (Transición Suave): "Justo ayudamos a implementar sistemas automatizados para eso. Si quieres te comparto un PDF de 5 min sin compromiso."

3. REGLA DE ORO DE RESPUESTA:
Si el prospecto tarda en responder, no insistas el mismo día. Haz un recontacto a las 72 horas con un valor nuevo o reacción a su historia activa.`,
    },
    {
      id: 'arsenal-scripts',
      badge: 'Bono 2 • Plantillas',
      title: 'Pack de 25 Guiones de Rompehielos & Seguimiento',
      description: 'Copys probados para romper el hielo a partir de historias, posts populares y encuestas interactivas.',
      tag: 'Scripts Copiables',
      actionType: 'modal',
      linkText: 'Abrir Catálogo de Scripts',
      modalContent: `PACK DE GUIONES TÁCTICOS PARA EL SETTER
==================================================

CATEGORÍA A: ROMPEHIELOS POR HISTORIAS ACTIVAS
1. "Hola [Nombre], vi lo que compartiste sobre [Tema]. Muy acertado lo de [Detalle]. ¿Es un reto recurrente con tus clientes actuales?"
2. "Tremendo punto el de tu última historia [Nombre]. ¿Qué herramienta usas hoy para gestionar esa parte del flujo?"

CATEGORÍA B: RESPUESTA A STICKERS DE INTERACCIÓN
3. "Hola [Nombre], vi que votaste en la encuesta de [Tema]. ¿Estás buscando optimizar esa parte este mes o fue por curiosidad?"
4. "¡Genial tu voto en la encuesta! La mayoría se traba en [Punto común]. ¿En tu caso cuál ha sido el mayor obstáculo?"

CATEGORÍA C: REACTIVACIÓN Y SEGUIMIENTO A LAS 48 HORAS
5. "Hola [Nombre], me quedé pensando en lo que comentaste sobre [Problema]. Armamos una guía rápida de 3 hojas con el paso a paso exacto para resolverlo. ¿Te gustaría que te la mande por aquí?"`,
    },
    {
      id: 'calculadora-metricas',
      badge: 'Bono 3 • Herramienta',
      title: 'Calculadora de Métricas del Setter',
      description: 'Framework numérico para determinar cuántos contactos, respuestas y diagnósticos necesitas para tu meta mensual.',
      tag: 'Matriz Numérica',
      actionType: 'modal',
      linkText: 'Ver Matriz de Métricas',
      modalContent: `CALCULADORA & BENCHMARKS DE CONVERSIÓN DEL SETTER
==================================================

MÉTRICAS ESTÁNDAR DE MERCADO (CONSULTORÍA HIGH-TICKET):
- Tasa de Respuesta a Aperturas Frías: 25% - 35%
- Tasa de Conversación a Envío de Lead Magnet: 40% - 50%
- Tasa de Lead Magnet a Llamada Agendada: 15% - 20%
- Tasa de Asistencia a Llamada (Show-Up Rate): 80%

SIMULACIÓN PARA 10 CLIENTES / CIERRES AL MES:
- Tasa de Cierre en Llamada (Closer): 20%
- Llamadas Completadas Requeridas: 50 llamadas.
- Llamadas Agendadas Totales: 62 reuniones (contando el 80% show-up).
- Conversaciones Calificadas con Recurso: ~310 prospectos.
- Mensajes de Apertura Nuevos por Mes: ~1,000 contactos.
- RITMO DIARIO REQUERIDO (22 días hábiles):
  -> 45 toques de prospección nuevos por día.
  -> 15 seguimientos de conversaciones abiertas.
  -> 3 agendas confirmadas por día.`,
    },
    {
      id: 'sistema-editorial',
      badge: 'Bono 4 • Arquitectura de Contenidos',
      title: 'Sistema Editorial y Matriz de Rotación 5x5',
      description: 'Calendario operativo semanal para balancear autoridad, quiebres de creencia, casos de éxito y llamados a la acción.',
      tag: 'Framework Estratégico',
      actionType: 'modal',
      linkText: 'Ver Sistema Editorial',
      modalContent: `SISTEMA EDITORIAL & MATRIZ DE ROTACIÓN 5X5
==================================================

LOS 5 PILARES INMUTABLES DE CONTENIDO:
1. QUIEBRE DE CREENCIA (Lunes):
   Desmonta un error común de tu industria. Muestra por qué el método tradicional ya no funciona y presenta el nuevo vehículo.
2. CASO DE ESTUDIO / RESULTADO (Martes):
   Desglose técnico de un cliente o resultado propio: Situación inicial, obstáculo y cómo el método generó el resultado.
3. HOW-TO / GUÍA TÁCTICA (Miércoles):
   Contenido educativo accionable que entrega valor práctico inmediato (genera guardados y autoridad técnica).
4. POLARIZACIÓN / VISIÓN DE MERCADO (Jueves):
   Postura firme ante malas prácticas del nicho. Filtra a los prospectos que no encajan con tu filosofía.
5. CONVERSIÓN DIRECTA POR RECURSO (Viernes):
   Lanzamiento del Lead Magnet de la semana invitando a comentar la palabra clave para abrir DMs en masa.

RUTINA DIARIA DE HISTORIAS COMPLEMENTARIAS:
- Mañana: Pregunta o contexto de trabajo cotidiano.
- Mediodía: Sticker interactivo (Encuesta / Termómetro) para alimentar el Laboratorio de Engagement.
- Tarde/Noche: Prueba social o testimonio con invitación a DM.`,
    },
    {
      id: 'mapa-maestro-instagram',
      badge: 'Bono 5 • Conversión Orgánica',
      title: 'Mapa Maestro de la Cuenta de Instagram',
      description: 'Arquitectura técnica 360° para conectar Avatar, Nombre SEO, Bio, Highlights fijas y el embudo directo hacia el DM.',
      tag: 'Blueprint 360°',
      actionType: 'modal',
      linkText: 'Ver Blueprint del Perfil',
      modalContent: `MAPA MAESTRO DE LA CUENTA DE INSTAGRAM (ARQUITECTURA 360°)
==================================================

FASE 1: LA PUERTA DE ENTRADA (INDEXABILIDAD & CONFIANZA)
- Foto de Perfil: Primer plano limpio, fondo liso contrastante, iluminación de estudio (usar prompt Midjourney generado en Perfil Magnético).
- Nombre SEO: [Nombre] | [Palabra Clave Exacta del Nicho] (Ej: Luis | Consultor Ventas IA).
- Bio (Estricto ≤ 150 caracteres):
  Línea 1: A quién ayudas y resultado.
  Línea 2: Nombre de tu sistema o credencial.
  Línea 3: Llamado a la acción con palabra clave.

FASE 2: EL MOTOR DE AUTORIDAD (LAS 5 HISTORIAS DESTACADAS FIJAS)
- Destacada 1 [EMPIEZA]: Quién eres, tu origen, por qué haces esto y qué van a encontrar aquí.
- Destacada 2 [MÉTODO]: Explicación visual de tu sistema en 3 o 4 pasos.
- Destacada 3 [CASOS]: Capturas de pantalla de resultados, métricas y mensajes de clientes satisfechos.
- Destacada 4 [RECURSO]: Presentación del Lead Magnet activo con instrucción de responder por DM.
- Destacada 5 [AGENDAR]: Explicación de cómo funciona tu llamada de diagnóstico y requisitos para calificar.

FASE 3: EL FEED DE CONVERSIÓN (LOS 3 POSTS FIJADOS)
- Pin 1: El post manifiesto de tu marca (tu tesis de mercado).
- Pin 2: El caso de éxito más contundente desglosado paso a paso.
- Pin 3: La oferta del Lead Magnet vigente para capturar tráfico nuevo permanentemente.`,
    },
    {
      id: 'comunidad-soporte',
      badge: 'Exclusivo • Comunidad',
      title: 'Canal de Feedback & Casos de Estudio',
      description: 'Acceso directo a la sala privada de análisis táctico de conversaciones, objeciones reales y calibración de guiones.',
      tag: 'Comunidad VIP',
      actionType: 'external',
      linkText: 'Unirme al Canal Privado →',
      url: 'https://t.me/+settermind_vip',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-2">
      {/* Encabezado */}
      <div className="border-b border-[#24334A] pb-6">
        <span className="inline-block bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sky-500/20 mb-2">
          Fase 3 • Gestión & Control
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Recursos, Plantillas & Bonos Exclusivos
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catálogo complementario con guías maestras, sistemas editoriales y frameworks para escalar tu prospección consultiva.
        </p>
      </div>

      {/* Grid de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((item) => (
          <div
            key={item.id}
            className="bg-[#162032] border border-[#24334A] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition hover:border-sky-500/40"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider truncate">
                  {item.badge}
                </span>
                <span className="bg-[#0B121E] text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-[#24334A] whitespace-nowrap ml-1">
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
              {item.actionType === 'modal' ? (
                <button
                  onClick={() => setActiveModal(item)}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-sky-950/40 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>📖</span>
                  <span>{item.linkText}</span>
                </button>
              ) : item.actionType === 'copy' ? (
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
                  className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-sky-950/40 flex items-center justify-center space-x-2 text-center"
                >
                  <span>🚀</span>
                  <span>{item.linkText}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Visor Modal de Contenido de Bonos */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#162032] border border-[#24334A] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#24334A] bg-[#0B121E]">
              <div>
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                  {activeModal.badge}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {activeModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E293B] transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-[#0B121E]/60 selection:bg-sky-500/30">
              {activeModal.modalContent}
            </div>

            <div className="p-4 border-t border-[#24334A] bg-[#0B121E] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                SetterMind • Activo Exclusivo
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCopy(activeModal.modalContent || '', activeModal.id)}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>📋</span>
                  <span>{copiedKey === activeModal.id ? '✓ Todo Copiado' : 'Copiar Contenido'}</span>
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="bg-[#1E293B] hover:bg-[#2A3B54] text-slate-300 text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
