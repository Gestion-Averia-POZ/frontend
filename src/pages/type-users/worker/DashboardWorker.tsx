import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Map } from "../../../components/layout";
import List from "../../../components/ui/LIst";
import { useAuth } from "../../../context/AuthContext";
import { ROUTES } from "../../../constants";

// ── Types ─────────────────────────────────────────────────────────────────────

type Periodo = "diario" | "semanal" | "mensual" | "anual";

// ── Mock chart data ───────────────────────────────────────────────────────────

const CHART_DATA: Record<
  Periodo,
  {
    label: string;
    asignados: number;
    atendidos: number;
    sinAtender: number;
    enRevision: number;
  }[]
> = {
  diario: [
    { label: "Lun", asignados: 5, atendidos: 3, sinAtender: 1, enRevision: 1 },
    { label: "Mar", asignados: 7, atendidos: 5, sinAtender: 1, enRevision: 1 },
    { label: "Mié", asignados: 4, atendidos: 4, sinAtender: 0, enRevision: 0 },
    { label: "Jue", asignados: 8, atendidos: 6, sinAtender: 1, enRevision: 1 },
    { label: "Vie", asignados: 6, atendidos: 4, sinAtender: 1, enRevision: 1 },
  ],
  semanal: [
    { label: "Sem 1", asignados: 20, atendidos: 15, sinAtender: 3, enRevision: 2 },
    { label: "Sem 2", asignados: 25, atendidos: 20, sinAtender: 3, enRevision: 2 },
    { label: "Sem 3", asignados: 18, atendidos: 14, sinAtender: 2, enRevision: 2 },
    { label: "Sem 4", asignados: 30, atendidos: 24, sinAtender: 4, enRevision: 2 },
  ],
  mensual: [
    { label: "Ene", asignados: 80, atendidos: 65, sinAtender: 10, enRevision: 5 },
    { label: "Feb", asignados: 70, atendidos: 58, sinAtender: 8, enRevision: 4 },
    { label: "Mar", asignados: 90, atendidos: 75, sinAtender: 10, enRevision: 5 },
    { label: "Abr", asignados: 85, atendidos: 70, sinAtender: 9, enRevision: 6 },
    { label: "May", asignados: 95, atendidos: 80, sinAtender: 10, enRevision: 5 },
  ],
  anual: [
    { label: "2021", asignados: 900, atendidos: 750, sinAtender: 100, enRevision: 50 },
    { label: "2022", asignados: 1050, atendidos: 900, sinAtender: 100, enRevision: 50 },
    { label: "2023", asignados: 1200, atendidos: 1000, sinAtender: 120, enRevision: 80 },
    { label: "2024", asignados: 1350, atendidos: 1150, sinAtender: 130, enRevision: 70 },
  ],
};

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: "diario", label: "Diario" },
  { key: "semanal", label: "Semanal" },
  { key: "mensual", label: "Mensual" },
  { key: "anual", label: "Anual" },
];

// ── Mock reports data ─────────────────────────────────────────────────────────

const REPORTES_DATA = [
  {
    id: 1,
    tipo: "Tubería Rota",
    servicio: "Agua",
    sector: "Unare",
    estado: "Pendiente",
    prioridad: "Alta",
    fecha: "12 May, 2024",
  },
  {
    id: 2,
    tipo: "Obstrucción",
    servicio: "Agua",
    sector: "Sierra Parima",
    estado: "En Proceso",
    prioridad: "Media",
    fecha: "15 May, 2024",
  },
  {
    id: 3,
    tipo: "Fuga",
    servicio: "Agua",
    sector: "Unare",
    estado: "Atendido",
    prioridad: "Alta",
    fecha: "20 May, 2024",
  },
  {
    id: 4,
    tipo: "Corte de Suministro",
    servicio: "Electricidad",
    sector: "Centro",
    estado: "Pendiente",
    prioridad: "Alta",
    fecha: "22 May, 2024",
  },
  {
    id: 5,
    tipo: "Acumulación de Desechos",
    servicio: "Aseo Urbano",
    sector: "La Llanada",
    estado: "Atendido",
    prioridad: "Baja",
    fecha: "25 May, 2024",
  },
];

// ── Config maps ───────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  Pendiente: { bg: "#F1F5F9", color: "#64748B", label: "PENDIENTE" },
  "En Proceso": { bg: "#FEF3C7", color: "#D97706", label: "EN PROCESO" },
  Atendido: { bg: "#DCFCE7", color: "#16A34A", label: "ATENDIDO" },
};

const PRIORIDAD_CONFIG: Record<string, { color: string }> = {
  Alta: { color: "#EF4444" },
  Media: { color: "#F97316" },
  Baja: { color: "#22C55E" },
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span
        className="text-3xl font-bold"
        style={{ color: valueColor ?? "#111827" }}
      >
        {value}
      </span>
      <span className="text-xs text-gray-400">{sub}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardWorker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<Periodo>("semanal");
  const [fecha, setFecha] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const chartData = CHART_DATA[periodo];

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0040DF] mb-1">
          Panel de Trabajador
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen de tus reportes asignados.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Asignados" value="30" sub="Total asignados" />
        <StatCard
          label="Atendidos"
          value="22"
          sub="Completados"
          valueColor="#0040DF"
        />
        <StatCard
          label="Sin Atender"
          value="5"
          sub="Requieren atención"
          valueColor="#EF4444"
        />
        <StatCard
          label="En Revisión"
          value="3"
          sub="En proceso de revisión"
          valueColor="#D97706"
        />
      </div>

      {/* Map */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Mapa de Reportes Asignados
        </h3>
        <div className="h-[380px] rounded-xl overflow-hidden">
          <Map />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <span className="text-sm font-semibold text-gray-700">
            Actividad de Reportes
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date picker */}
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-600 outline-none focus:border-[#0040DF] transition-colors cursor-pointer"
            />
            {/* Period toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
              {PERIODOS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPeriodo(key)}
                  className={`px-3 py-1 transition-colors ${
                    periodo === key
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: "12px" }} />
            <Line
              dataKey="asignados"
              name="Asignados"
              stroke="#0040DF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="atendidos"
              name="Atendidos"
              stroke="#16A34A"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="sinAtender"
              name="Sin Atender"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="enRevision"
              name="En Revisión"
              stroke="#D97706"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Reports list */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Reportes</h2>
        <List
          data={REPORTES_DATA}
          filters={[
            { field: "estado", label: "Estado", type: "checkbox" },
            { field: "prioridad", label: "Prioridad", type: "checkbox" },
            { field: "servicio", label: "Servicio", type: "checkbox" },
            { field: "sector", label: "Buscar sector", type: "text" },
          ]}
          renderRowId={(id) => (
            <span className="font-mono text-xs text-gray-400">
              #URB-{String(id).padStart(4, "0")}
            </span>
          )}
          columns={[
            {
              key: "tipo",
              header: "Tipo de Avería",
              render: (row) => (
                <span className="font-semibold text-gray-900">{row.tipo}</span>
              ),
            },
            {
              key: "servicio",
              header: "Servicio",
              render: (row) => (
                <span className="text-gray-700">{row.servicio}</span>
              ),
            },
            {
              key: "fecha",
              header: "Fecha",
              render: (row) => (
                <span className="text-gray-500">{row.fecha}</span>
              ),
            },
            {
              key: "sector",
              header: "Sector",
              render: (row) => (
                <span className="text-gray-500">{row.sector}</span>
              ),
            },
            {
              key: "estado",
              header: "Estado",
              render: (row) => {
                const s = ESTADO_CONFIG[row.estado] ?? {
                  bg: "#F1F5F9",
                  color: "#64748B",
                  label: row.estado,
                };
                return (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                );
              },
            },
            {
              key: "prioridad",
              header: "Prioridad",
              render: (row) => {
                const s = PRIORIDAD_CONFIG[row.prioridad] ?? {
                  color: "#64748B",
                };
                return (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-medium" style={{ color: s.color }}>
                      {row.prioridad}
                    </span>
                  </div>
                );
              },
            },
          ]}
          actions={[
            {
              label: "Ver Detalles",
              onClick: (row) =>
                navigate(ROUTES.DETALLES_REPORTE, {
                  state: {
                    reporte: {
                      id: row.id,
                      correlativo: `#URB-${String(row.id).padStart(4, "0")}`,
                      empresa: "",
                      servicio: row.servicio,
                      prioridad: row.prioridad,
                      estado: row.estado,
                      sector: row.sector,
                      responsable: "",
                      creadoPor: "",
                    },
                    mode: "view",
                  },
                }),
            },
          ]}
          itemsPerPage={5}
        />
      </section>
    </div>
  );
}
