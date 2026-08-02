"use client";

import { LayoutDashboard, FileText, Calendar, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 px-2 py-4 mb-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
            IFC
          </div>
          <span className="font-semibold text-white text-lg">Finanzas App</span>
        </div>

        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600 text-white font-medium">
            <LayoutDashboard size={20} />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <FileText size={20} />
            Informes Mensuales
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <Calendar size={20} />
            Comité Trimestral
          </a>
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 space-y-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition">
          <Settings size={20} />
          Configuración
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-rose-400 transition">
          <LogOut size={20} />
          Cerrar Sesión
        </a>
      </div>
    </aside>
  );
}