"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { Card, Metric, Text, AreaChart, BadgeDelta } from "@tremor/react";

interface FinancialRecord {
  id: string;
  month: string;
  ingresos: number;
  ebitda: number;
  ktno: number;
  ciclo_caja: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndFetchData() {
      // 1. Verificar sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      // 2. Cargar datos si está autenticado
      const { data: kpiData, error } = await supabase
        .from("financial_kpis")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error al obtener datos de Supabase:", error);
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

  // Tomamos el último registro cargado para mostrarlo en las tarjetas principales
  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Portal de Inteligencia Financiera Continua
            </h1>
            <p className="text-slate-500">
              Dashboard de Control Ejecutivo — Conectado a Supabase
            </p>
          </header>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Cargando datos financieros desde la nube...
            </div>
          ) : (
            <>
              {/* Tarjetas de KPIs con Datos de Supabase */}
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

              {/* Gráfica Dinámica cargada desde la Base de Datos */}
              <Card>
                <Text className="font-medium text-slate-700 mb-2">
                  Evolución de Ingresos vs. EBITDA (Datos en tiempo real)
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