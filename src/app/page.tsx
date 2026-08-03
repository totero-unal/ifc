"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { Card, Metric, Text, AreaChart, BadgeDelta } from "@tremor/react";
import { LogOut } from "lucide-react";

interface FinancialRecord {
  id: string;
  company_key: string;
  month: string;
  ingresos: number;
  ebitda: number;
  ktno: number;
  ciclo_caja: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [userCompany, setUserCompany] = useState<string>("");
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login"; // Fuerza la recarga completa y limpia la sesión
  };

  useEffect(() => {
    async function checkAuthAndFetchData() {
      // 1. Obtener usuario activo
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const role = user.user_metadata?.role || "client";
      const companyKey = user.user_metadata?.company_key || "";

      setUserRole(role);
      setUserCompany(companyKey);

      // 2. Construir la consulta
      let query = supabase.from("financial_kpis").select("*");

      // Si no es admin, filtramos estrictamente por la llave de su empresa
      if (role !== "admin") {
        if (!companyKey) {
          setLoading(false);
          return;
        }
        query = query.eq("company_key", companyKey);
      }

      const { data: kpiData, error } = await query.order("created_at", { ascending: true });

      if (error) {
        console.error("Error al consultar datos:", error);
      } else if (kpiData) {
        const formattedData = kpiData.map((item) => ({
          ...item,
          ingresos: Number(item.ingresos),
          ebitda: Number(item.ebitda),
          ktno: Number(item.ktno),
          ciclo_caja: Number(item.ciclo_caja),
        }));
        setData(formattedData);
      }
      setLoading(false);
    }

    checkAuthAndFetchData();
  }, [router]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Portal de Inteligencia Financiera Continua
            </h1>
            <p className="text-slate-500">
              Dashboard de Control Ejecutivo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-block px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              {userRole === "admin" ? "Modo Administrador" : `Empresa: ${userCompany}`}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg transition"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </header>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Cargando datos financieros desde la nube...
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              No hay registros financieros disponibles para este perfil.
            </div>
          ) : (
            <>
              {/* Tarjetas de KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card decoration="top" decorationColor="indigo">
                  <Text>Ingresos del Periodo</Text>
                  <Metric>$ {latest ? latest.ingresos : 0} M</Metric>
                  <div className="flex items-center gap-2 mt-2">
                    <BadgeDelta deltaType="moderateIncrease">+14.2%</BadgeDelta>
                    <Text className="text-xs">vs. Mes Anterior</Text>
                  </div>
                </Card>

                <Card decoration="top" decorationColor="emerald">
                  <Text>EBITDA</Text>
                  <Metric>$ {latest ? latest.ebitda : 0} M</Metric>
                  <div className="flex items-center gap-2 mt-2">
                    <BadgeDelta deltaType="increase">
                      {latest && latest.ingresos
                        ? ((latest.ebitda / latest.ingresos) * 100).toFixed(1)
                        : 0}
                      %
                    </BadgeDelta>
                    <Text className="text-xs">Margen EBITDA</Text>
                  </div>
                </Card>

                <Card decoration="top" decorationColor="amber">
                  <Text>KTNO</Text>
                  <Metric>$ {latest ? latest.ktno : 0} M</Metric>
                  <div className="flex items-center gap-2 mt-2">
                    <Text className="text-xs text-slate-500">
                      PKT:{" "}
                      {latest && latest.ingresos
                        ? ((latest.ktno / latest.ingresos) * 100).toFixed(1)
                        : 0}
                      %
                    </Text>
                  </div>
                </Card>

                <Card decoration="top" decorationColor="blue">
                  <Text>Ciclo de Caja (CCC)</Text>
                  <Metric>{latest ? latest.ciclo_caja : 0} Días</Metric>
                  <div className="flex items-center gap-2 mt-2">
                    <BadgeDelta deltaType="moderateDecrease">-5 días</BadgeDelta>
                    <Text className="text-xs">Mejora en liquidez</Text>
                  </div>
                </Card>
              </div>

              {/* Gráfica Dinámica */}
              <Card>
                <Text className="font-medium text-slate-700 mb-2">
                  Evolución de Ingresos vs. EBITDA
                </Text>
                <AreaChart
                  className="h-72 mt-4"
                  data={data}
                  index="month"
                  categories={["ingresos", "ebitda"]}
                  colors={["indigo", "emerald"]}
                  valueFormatter={(number) => `$ ${number}M`}
                />
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}