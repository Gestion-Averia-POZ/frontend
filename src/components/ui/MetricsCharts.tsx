import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ── Donut ────────────────────────────────────────

const PIE_DATA = [
  { name: "Electricidad", value: 40 },
  { name: "Agua", value: 30 },
  { name: "Gas", value: 20 },
  { name: "Aseo", value: 10 },
];

const PIE_COLORS = ["#1e293b", "#3b82f6", "#f97316", "#22c55e"];

// Etiqueta que se dibuja directamente sobre cada segmento
const renderLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${value}%`}
    </text>
  );
};

// ── Line ─────────────────────────────────────────

const DATA_SEMANAL = [
  { label: "Sem 1", recibidos: 5,  resueltos: 20 },
  { label: "Sem 2", recibidos: 35, resueltos: 25 },
  { label: "Sem 3", recibidos: 55, resueltos: 40 },
  { label: "Sem 4", recibidos: 40, resueltos: 50 },
  { label: "Sem 5", recibidos: 60, resueltos: 30 },
  { label: "Sem 6", recibidos: 80, resueltos: 55 },
  { label: "Sem 7", recibidos: 55, resueltos: 65 },
  { label: "Sem 8", recibidos: 50, resueltos: 25 },
];

const DATA_DIARIO = [
  { label: "Lun", recibidos: 8,  resueltos: 5  },
  { label: "Mar", recibidos: 15, resueltos: 10 },
  { label: "Mié", recibidos: 12, resueltos: 14 },
  { label: "Jue", recibidos: 20, resueltos: 9  },
  { label: "Vie", recibidos: 18, resueltos: 16 },
  { label: "Sáb", recibidos: 7,  resueltos: 12 },
  { label: "Dom", recibidos: 4,  resueltos: 6  },
];

type Vista = "semanal" | "diario";

// ── Componente ───────────────────────────────────

export default function MetricsCharts() {
  const [vista, setVista] = useState<Vista>("semanal");

  const lineData = vista === "semanal" ? DATA_SEMANAL : DATA_DIARIO;
  const lineTitle =
    vista === "semanal"
      ? "Tendencia Semanal (Recibidos vs Resueltos)"
      : "Tendencia Diaria (Recibidos vs Resueltos)";

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Donut — Reportes por Servicio */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Reportes por Servicio
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={PIE_DATA}
              cx="40%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              paddingAngle={2}
              labelLine={false}
              label={renderLabel}
            >
              {PIE_DATA.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry: { payload?: { value: number } }) =>
                `${value} ${entry.payload?.value ?? ""}%`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line — Tendencia */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">{lineTitle}</h3>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setVista("diario")}
              className={`px-3 py-1 transition-colors ${
                vista === "diario"
                  ? "bg-[#1e293b] text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setVista("semanal")}
              className={`px-3 py-1 transition-colors ${
                vista === "semanal"
                  ? "bg-[#1e293b] text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              Semanal
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
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
            <Line
              type="monotone"
              dataKey="recibidos"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="resueltos"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
