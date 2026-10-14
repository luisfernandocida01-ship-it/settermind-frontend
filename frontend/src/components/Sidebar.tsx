'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navSections = [
    {
      phase: 'FASE 1: ESTRATEGIA & RADAR',
      items: [
        { name: '1. Estrategia & Oportunidades', path: '/strategies', icon: '✦' },
        { name: '2. Radar de Prospectos', path: '/prospect', icon: '◎' },
      ],
    },
    {
      phase: 'FASE 2: CONVERSIÓN & MENSAJES',
      items: [
        { name: '3. Fábrica de Guiones', path: '/content-factory', icon: '💬' },
        { name: '4. Imán de Perfil', path: '/profile-magnet', icon: '🧲' },
        { name: '5. Pipeline & Mensajes', path: '/conversations', icon: '🚀' },
      ],
    },
{
      phase: 'FASE 3: GESTIÓN & CONTROL',
      items: [
        { name: '6. Historial de Análisis', path: '/history', icon: '📋' },
        { name: '7. Productos & Hotlinks', path: '/resources', icon: '🔗' },
        { name: '8. Recursos & Bonos', path: '/bonuses', icon: '🎁' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#080E18] border-r border-[#1E293B] min-h-screen flex flex-col justify-between p-5 text-gray-200 shrink-0 shadow-xl z-20">
      <div>
        {/* Encabezado Marca */}
        <div className="mb-6 pb-5 border-b border-[#1E293B]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E2A47] border border-[#F59E0B] text-[#FBBF24] font-black flex items-center justify-center text-xl shadow-md">
              M
            </div>
            <div>
              <h2 className="text-white font-extrabold text-base leading-tight tracking-wide">SetterMind AI</h2>
              <p className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">Mentes al Mercado</p>
            </div>
          </div>

          <Link
            href="/"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              pathname === '/'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
                : 'hover:bg-[#131E2E] text-gray-300 hover:text-white'
            }`}
          >
            <span>📊</span>
            <span>Dashboard Principal</span>
          </Link>
        </div>

        {/* Fases de Navegación */}
        <nav className="space-y-6">
          {navSections.map((section) => (
            <div key={section.phase}>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-3 mb-2">
                {section.phase}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                          isActive
                            ? 'bg-[#132338] text-sky-400 border border-sky-500/40 font-bold shadow-inner'
                            : 'hover:bg-[#101926] hover:text-white text-gray-300'
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer del Menú */}
      <div className="pt-4 border-t border-[#1E293B] space-y-3">
        <div className="bg-[#050A10] border border-[#1E293B] rounded-lg p-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
            <span>LICENCIA HOTMART</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-gray-300 font-medium mt-0.5">Activa • Plan Ilimitado</p>
        </div>

        <button
          onClick={logout}
          className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-700/50 text-red-200 text-xs font-bold py-2 px-3 rounded-lg transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}