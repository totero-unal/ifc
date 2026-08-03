"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // O ruta relativa
import { supabase } from "@/lib/supabase";  // O ruta relativa
import { ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const [month, setMonth] = useState("");
  const [ingresos, setIngresos] = useState("");
  const [ebitda, setEbitda] = useState("");
  const [ktno, setKtno] = useState("");
  const [cicloCaja, setCicloCaja] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  // Proteger la ruta si no hay sesión
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from("financial_kpis").insert([
      {
        month,
        ingresos: parseFloat(ingresos),
        ebitda: parseFloat(ebitda),
        ktno: parseFloat(ktno),
        ciclo_caja: parseInt(cicloCaja),
      },
    ]);

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: "Error al guardar el registro." });
    } else {
      setMessage({ type: "success", text: "¡Registro financiero agregado con éxito!" });
      // Limpiar formulario
      setMonth("");
      setIngresos("");
      setEbitda("");
      setKtno("");
      setCicloCaja("");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition"
          >
            <ArrowLeft size={16} /> Volver al Dashboard
          </button>

          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Cargar Métricas Financieras</h1>
            <p className="text-slate-500">Ingresa los valores del periodo para actualizar el dashboard ejecutivo.</p>
          </header>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg text-sm text-center font-medium ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mes del Periodo</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Jul, Ago, Sep"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ingresos (Millones)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="250"
                    value={ingresos}
                    onChange={(e) => setIngresos(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">EBITDA (Millones)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="85"
                    value={ebitda}
                    onChange={(e) => setEbitda(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">KTNO (Millones)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="48"
                    value={ktno}
                    onChange={(e) => setKtno(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ciclo de Caja (Días)</label>
                  <input
                    type="number"
                    required
                    placeholder="40"
                    value={cicloCaja}
                    onChange={(e) => setCicloCaja(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 mt-4"
              >
                {loading ? "Guardando datos..." : "Guardar Registro"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}