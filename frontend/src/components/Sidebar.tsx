// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationLinks = [
  { group: "ESTRATEGIA & RADAR", items: [
    { name: "Estrategia & Avatar", href: "/strategies", icon: "✦" },
    { name: "Radar de Prospectos", href: "/prospect", icon: "◎" },
  ]},
  { group: "CONVERSIÓN & GUIONES", items: [
    { name: "Fábrica de Guiones", href: "/content-factory", icon: "💬" },
    { name: "Imán de Perfil", href: "/profile-magnet", icon: "🧲" },
    { name: "Pipeline & Mensajes", href: "/conversations", icon: "🚀" },
  ]},
  { group: "GESTIÓN & CONTROL", items: [
    { name: "Historial de Análisis", href: "/history", icon: "📋" },
    { name: "Recursos & Bonos", href: "/resources", icon: "📚" },
  ]}
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#0B111A] border-r border-[#1E2D42] flex flex-col justify-between text-slate-200">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1E2D42]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E2A47] border border-[#D4AF37] flex items-center justify-center font-bold text-[#F3C969] text-xl shadow-lg">
              M
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base leading-tight">SetterMind AI</h1>
              <p className="text-[11px] text-[#D4AF37] font-medium">Mentes al Mercado</p>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="p-4 space-y-6">
          {navigationLinks.map((section, idx) => (
            <div key={idx}>
              <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                {section.group}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[#0E2A47] text-white border border-[#0284C7]/50 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Estado de Licencia */}
      <div className="p-4 border-t border-[#1E2D42]">
        <div className="bg-[#111A28] border border-[#1E2D42] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Licencia Hotmart</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-xs font-semibold text-white truncate">Activa • Plan Ilimitado</p>
          <p className="text-[10px] text-slate-400 mt-1">settermind.mentesalmercado.online</p>
        </div>
      </div>
    </aside>
  );
}