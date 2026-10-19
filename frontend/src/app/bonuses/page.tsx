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
}

export default function BonusesPage() {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<BonusItem | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [ticketPrice, setTicketPrice] = useState<number>(500);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(3000);
  const [dailyContacts, setDailyContacts] = useState<number>(25);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resources: BonusItem[] = [
    {
      id: 'guia-prospeccion',
      badge: 'Bono 1 • Metodología Outbound',
      title: 'Manual Maestro: Prospección Consultiva & Settering',
      description: 'Comprende el rol exacto del Setter en Instagram: cómo separar la prospección del cierre y generar citas cualificadas con SetterMind AI.',
      tag: 'Manual Operativo',
      actionType: 'modal',
      linkText: 'Ver Manual Completo',
      modalContent: `MANUAL MAESTRO: PROSPECCIÓN CONSULTIVA Y EL ROL DEL SETTER
Metodología de Prospección Cualificada • Powered by SetterMind AI
================================================================================

1. ¿QUÉ ES EL SETTERING Y POR QUÉ ES EL ESLABÓN MÁS RENTABLE?
El Settering es la ciencia de identificar, contactar y cualificar prospectos en redes sociales con un único objetivo: agendar una llamada de diagnóstico o cita de ventas.
- El Setter NO cierra ventas: Se enfoca 100% en el Top of Funnel (generar interés y cualificar).
- El Closer NO busca prospectos: Se enfoca únicamente en llamadas con prospectos pre-cualificados.
- Separar estas dos funciones incrementa la eficiencia comercial hasta en un 67% (Harvard Business Review).

2. PSICOLOGÍA DEL PROSPECTO EN INSTAGRAM
Instagram es un canal social y personal; los usuarios están en "modo exploración", no en "modo compra".
- Regla de Reciprocidad: Aporta valor o valida su trabajo antes de pedir compromiso.
- Tasa de Apertura en DM: 85% - 90% (frente al 20% del email tradicional).
- Ventana de Atención: Cuentas con 3 a 5 segundos para que tu mensaje no sea clasificado como spam invasivo.

3. EL FILTRO ICP DE 5 DIMENSIONES EN SETTERMIND AI:
Antes de abrir un chat, califica al perfil en:
1. Dimensión Demográfica: Ubicación geográfica y rango de edad.
2. Dimensión Profesional: Cargo en bio ("Founder", "Coach", "CEO", "Consultor").
3. Dimensión Psicográfica: Aspiraciones de escala, miedos de estancamiento.
4. Dimensión Conductual: Sigue cuentas referentes del nicho y comenta posts técnicos.
5. Dimensión Situacional (Trigger): Lanzamiento reciente, contratación activa o búsqueda de clientes.

4. CÓMO SETTERMIND AI EJECUTA ESTA METODOLOGÍA:
- Paso 1 (Radar de Prospectos): Rastrea comentarios calificados en posts de referentes sin perder tiempo navegando perfiles manuales.
- Paso 2 (Fábrica de Contenidos): Construye tu autoridad pasiva previa al contacto con carruseles y Reels educativos.
- Paso 3 (Pipeline & Mensajes): Genera aperturas contextuales en segundos basadas en el dolor exacto del prospecto.`,
    },
    {
      id: 'arsenal-scripts',
      badge: 'Bono 2 • Plantillas Probadas',
      title: 'Pack de 25 Guiones de Rompehielos & Seguimiento',
      description: 'Colección táctica de frases de apertura categorizadas por contexto de interacción, con tasas de respuesta auditadas del 30% al 52%.',
      tag: 'Scripts Copiables',
      actionType: 'modal',
      linkText: 'Abrir Catálogo de Scripts',
      modalContent: `CATÁLOGO MAESTRO DE OPENERS POR CONTEXTO (SETTERMIND AI)
Guiones con Tasa de Respuesta Comprobada >30%
================================================================================

CATEGORÍA 1: PROSPECTOS EN FRÍO (Sin Interacción Previa)
1. "Hola [Nombre], vi que estás trabajando en [Área visible en su perfil]. He estado investigando [Tema relacionado] y encontré un insight que contradice lo que el 90% del nicho hace. ¿Te interesaría que te lo comparta por aquí?" (Tasa de respuesta: ~34%)
2. "[Nombre], noté en tu bio que trabajas con [Nicho]. El 68% de los consultores con los que hablamos mencionan [Problema común] como su mayor cuello de botella. ¿Es un reto con el que estás lidiando actualmente?"
3. "Impresionante lo que estás construyendo en [Proyecto], [Nombre]. Particularmente [Detalle de su post]. ¿Actualmente estás enfocado en escalar la captación orgánica o corres pauta?"

CATEGORÍA 2: SEGUIDORES RECIENTES (Te siguieron en los últimos 7 días)
4. "¡Gracias por el follow, [Nombre]! Estuve mirando tu perfil y el trabajo que haces con [Especialidad] es de primer nivel. ¿Cuál dirías que es tu mayor desafío este mes para cerrar clientes?" (Tasa de respuesta: ~41%)
5. "Hola [Nombre], bienvenido por aquí. Veo que ambos estamos en el sector de [Industria]. ¿Qué fue lo que más te llamó la atención de mi perfil? Siempre me gusta conocer a los nuevos colegas."

CATEGORÍA 3: INTERACCIÓN PREVIA (Comentaron tu post o historia)
6. "Aprecio mucho tu comentario en [Post específico], [Nombre]. Lo que mencionaste sobre [Punto exacto] es justo lo que vemos con muchos profesionales. ¿Hace cuánto tiempo vienes implementando ese enfoque?" (Tasa de respuesta: ~52%)
7. "Vi que participaste en la encuesta de Stories sobre [Tema]. Me dio curiosidad: ¿es un área en la que estás trabajando activamente hoy o solo estabas explorando opciones?"

CATEGORÍA 4: BASADOS EN CONTENIDO DEL PROSPECTO (Módulo Radar)
8. "Tu último Reel sobre [Tema específico] resonó muchísimo conmigo, [Nombre]. En especial el punto sobre [Detalle]. Nosotros desarrollamos un framework para resolver [Dolor relacionado]. ¿Te gustaría que te mande un PDF de 2 min con el paso a paso?" (Tasa de respuesta: ~43%)
9. "¡Felicidades por [Logro o evento que publicó], [Nombre]! Muy merecido. Curioso: ¿qué estrategia usaron para resolver la prospección previa al evento?"

CATEGORÍA 5: REACTIVACIÓN Y SEGUIMIENTO POST-60 DÍAS
10. "Hola [Nombre], sé que conversamos hace unos meses sobre [Tema]. Desde entonces desarrollamos una guía paso a paso sobre [Solución al dolor]. Me acordé de ti inmediatamente. ¿Te interesa que te la envíe sin compromiso?" (Tasa de respuesta: ~33%)
11. "Hola [Nombre], vi que [Noticia/Cambio técnico de la industria] acaba de salir. Muchos en tu nicho están teniendo que reestructurar su captación. ¿Cómo te ha impactado este cambio?"`,
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
SetterMind AI • Metodología de Métricas de Alto Rendimiento
================================================================================

1. BENCHMARKS ESTÁNDAR DEL SETTER PROFESIONAL:
- Tasa de Respuesta a Aperturas Frías: 30% - 40% (utilizando warm-up o interacción previa).
- Tasa de Conversación a Envío de Recurso (Lead Magnet): 40% - 50%.
- Tasa de Recurso a Llamada Agendada: 15% - 25%.
- Tasa de Asistencia a Llamada (Show-Up Rate): 70% - 80% (con recordatorios automáticos 24h y 1h antes).

2. MODELO DE CUOTA MENSUAL (EJEMPLO $3,000 USD / MES):
- Ticket de Venta: $500 USD (6 cierres necesarios para la meta).
- Tasa de Cierre del Closer en Llamada: 20%.
- Citas Asistidas Requeridas: 30 videollamadas en el mes.
- Citas Agendadas Totales: ~38 reuniones (considerando el show-up rate).
- Prospectos Calificados a Contactar: ~25 toques diarios en 22 días hábiles.`,
    },
    {
      id: 'sistema-editorial',
      badge: 'Bono 4 • Arquitectura de Contenidos',
      title: 'Sistema Editorial y Matriz de Rotación 5x5',
      description: 'Estructura semanal basada en los 4 pilares inmutables del Settering para generar autoridad, guardados y DMs espontáneos.',
      tag: 'Framework Estratégico',
      actionType: 'modal',
      linkText: 'Ver Sistema Editorial',
      modalContent: `SISTEMA EDITORIAL Y MATRIZ DE AUTORIDAD PRE-CONTACTO
SetterMind AI • La Ciencia del Alcance y Calificación Pasiva
================================================================================

1. LA FÓRMULA DE LOS 4 PILARES DE CONTENIDO:
- 40% PILAR EDUCATIVO (Posicionamiento Técnico):
  Enseña el QUÉ y el POR QUÉ de tu método, pero deja el CÓMO específico para el DM.
  Formato: Carruseles de 7 a 10 slides o Reels tutoriales.
  Métrica: Guardados (la señal algorítmica más poderosa de Instagram).

- 30% PILAR SOCIAL PROOF (Confianza y Validación de Terceros):
  Screenshots de resultados reales, testimonios y métricas de clientes.
  Efecto: Los posts de prueba social generan un 267% más de DMs entrantes espontáneos.

- 20% PILAR CONEXIÓN (Humanización y Reducción de Barreras):
  Historias personales, fracasos superados y trabajo del día a día.
  Efecto: Elimina la percepción de vendedor frío y construye afinidad real.

- 10% PILAR LLAMADO A LA ACCIÓN DIRECTO (Conversión):
  Invitación a comentar una palabra clave para recibir un Lead Magnet o agendar diagnóstico.

2. CÓMO USAR LA FÁBRICA DE CONTENIDOS EN SETTERMIND AI:
Utiliza el Módulo 3 para generar borradores completos de carruseles, ganchos de Reels y copies optimizados para estos 4 pilares en menos de 2 minutos.`,
    },
    {
      id: 'mapa-maestro-instagram',
      badge: 'Bono 5 • Conversión Orgánica',
      title: 'Mapa Maestro de la Cuenta de Instagram',
      description: 'Arquitectura técnica 360° para transformar tu cuenta en una landing page de alta conversión: Bio en 4 líneas, Nombre SEO y Highlights fijos.',
      tag: 'Blueprint 360°',
      actionType: 'modal',
      linkText: 'Ver Blueprint del Perfil',
      modalContent: `MAPA MAESTRO DEL PERFIL MAGNETIZADOR DE SETTERING
SetterMind AI • Anatomía de la Tarjeta de Presentación Digital
================================================================================

1. NOMBRE SEO (30 CARACTERES INDEXABLES):
- Estructura: [Nombre Real] | [Especialidad o Nicho].
- Ejemplos: "Luis Cida | Setter B2B" o "Carlos M. | Captación Coaches".
- Por qué funciona: Permite que los prospectos te encuentren al buscar soluciones en la barra de exploración.

2. FÓRMULA DE LA BIOGRAFÍA EN 4 LÍNEAS (150 CARACTERES):
- Línea 1 (Credencial): "Especialista en Prospección Outbound".
- Línea 2 (Propuesta de Valor): "Ayudo a agencias a generar 20-30 citas/mes".
- Línea 3 (Prueba Social): "+150 agendas calificadas generadas".
- Línea 4 (CTA Claro): "DM 'SISTEMA' para enviarte la guía de 3 min 👇".

3. LOS 5 HIGHLIGHTS PERMANENTES (HISTORIAS DESTACADAS):
1. Sobre Mí: Quién eres, tu trayectoria y por qué haces esto.
2. Resultados: Pruebas visuales, métricas y capturas de clientes.
3. Método: Explicación visual de cómo funciona tu sistema en 3 pasos.
4. Recurso: Presentación del Lead Magnet activo con invitación al DM.
5. Agendar: Explicación de cómo funciona la llamada de diagnóstico de 15 min.

4. AUTOMATIZACIÓN CON PERFIL MAGNÉTICO EN SETTERMIND AI:
El Módulo 4 de SetterMind AI genera automáticamente tu biografía calibrada, el nombre SEO y los guiones de tus 5 historias destacadas con un solo clic.`,
    },
    {
      id: 'comunidad-soporte',
      badge: 'Exclusivo • Comunidad VIP',
      title: 'Canal de Feedback & Casos de Estudio',
      description: 'Acceso directo a la sala privada y mentoría directa para análisis táctico de conversaciones, objeciones reales y calibración de guiones.',
      tag: 'Comunidad VIP',
      actionType: 'external',
      linkText: 'Unirme al Canal de Telegram →',
      url: 'https://t.me/+529931741381',
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
          Metodología táctica de Settering y frameworks complementarios para maximizar el uso de SetterMind AI.
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
              {item.id === 'calculadora-metricas' ? (
                <button
                  onClick={() => setShowCalculator(true)}
                  className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-sky-950/40 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>🧮</span>
                  <span>Abrir Simulador Interactivo</span>
                </button>
              ) : item.actionType === 'modal' ? (
                <button
                  onClick={() => setActiveModal(item)}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-sky-950/40 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>📖</span>
                  <span>{item.linkText}</span>
                </button>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-emerald-950/40 flex items-center justify-center space-x-2"
                >
                  <span>🚀</span>
                  <span>{item.linkText}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Genérico con Copiado y Descarga */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#101927] border border-[#24334A] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#24334A] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  {activeModal.badge}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {activeModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 text-lg rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap selection:bg-sky-500 selection:text-white">
              {activeModal.modalContent}
            </div>

            <div className="p-4 border-t border-[#24334A] flex flex-wrap items-center justify-between gap-3 bg-[#0B121E]/60 rounded-b-2xl">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(activeModal.modalContent || '', activeModal.id)}
                  className={`text-xs font-bold py-2 px-4 rounded-lg transition flex items-center space-x-1.5 ${
                    copiedKey === activeModal.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 border border-sky-500/30'
                  }`}
                >
                  <span>📋</span>
                  <span>{copiedKey === activeModal.id ? '¡Copiado!' : 'Copiar Contenido'}</span>
                </button>
                <button
                  onClick={() => handleDownload(activeModal.id, activeModal.modalContent || '')}
                  className="bg-[#1E293B] hover:bg-[#2A3B54] text-slate-200 text-xs font-bold py-2 px-4 rounded-lg border border-[#334155] transition flex items-center space-x-1.5"
                >
                  <span>💾</span>
                  <span>Descargar (.txt)</span>
                </button>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-5 rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Simulador Interactivo */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#101927] border border-[#24334A] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#24334A] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  Bono 3 • Simulador Interactivo
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Calculadora de Retorno y Cuota del Setter
                </h3>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-slate-400 hover:text-white p-1 text-lg rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">Ticket Promedio ($)</label>
                  <input
                    type="number"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value) || 0)}
                    className="w-full bg-[#0B121E] border border-[#24334A] text-white text-sm rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">Meta Mensual ($)</label>
                  <input
                    type="number"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(Number(e.target.value) || 0)}
                    className="w-full bg-[#0B121E] border border-[#24334A] text-white text-sm rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">Toques / Día</label>
                  <input
                    type="number"
                    value={dailyContacts}
                    onChange={(e) => setDailyContacts(Number(e.target.value) || 0)}
                    className="w-full bg-[#0B121E] border border-[#24334A] text-white text-sm rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {(() => {
                const requiredClients = ticketPrice > 0 ? Math.ceil(monthlyGoal / ticketPrice) : 0;
                const callsNeeded = Math.ceil(requiredClients / 0.2);
                const bookedCalls = Math.ceil(callsNeeded / 0.75);
                const qualifiedConversations = Math.ceil(bookedCalls / 0.2);
                const monthlyCapacity = dailyContacts * 22;
                const estimatedResponses = Math.round(monthlyCapacity * 0.35);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[#0B121E] border border-[#24334A] p-3 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Cierres Meta</span>
                        <p className="text-xl font-extrabold text-emerald-400 mt-1">{requiredClients}</p>
                      </div>
                      <div className="bg-[#0B121E] border border-[#24334A] p-3 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Llamadas Claves</span>
                        <p className="text-xl font-extrabold text-sky-400 mt-1">{callsNeeded}</p>
                      </div>
                      <div className="bg-[#0B121E] border border-[#24334A] p-3 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Agendas Totales</span>
                        <p className="text-xl font-extrabold text-indigo-400 mt-1">{bookedCalls}</p>
                      </div>
                      <div className="bg-[#0B121E] border border-[#24334A] p-3 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Respuestas Est.</span>
                        <p className="text-xl font-extrabold text-amber-400 mt-1">{estimatedResponses}</p>
                      </div>
                    </div>

                    <div className="bg-sky-950/20 border border-sky-500/30 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                      <p className="font-bold text-sky-300">Diagnóstico Táctico SetterMind AI:</p>
                      <p>
                        Para alcanzar tu meta de <span className="text-white font-bold">${monthlyGoal.toLocaleString()} USD</span> con un ticket de <span className="text-white font-bold">${ticketPrice.toLocaleString()} USD</span>, requieres agendar <span className="text-emerald-400 font-bold">{bookedCalls} reuniones</span>.
                      </p>
                      <p>
                        Con tu ritmo de <span className="text-white font-bold">{dailyContacts} contactos/día</span> (capacidad de {monthlyCapacity} contactos en 22 días hábiles), SetterMind AI optimiza la tasa de respuesta promedio al 35% ({estimatedResponses} conversaciones activas), asegurando el volumen requerido sin agotamiento manual.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-[#24334A] flex justify-end bg-[#0B121E]/60 rounded-b-2xl">
              <button
                onClick={() => setShowCalculator(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-5 rounded-lg transition"
              >
                Cerrar Simulador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
