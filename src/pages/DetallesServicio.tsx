import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CirclePlus } from "lucide-react";
import { ROUTES } from "../constants";
import { Input, Modal } from "../components/ui";
import { Map } from "../components/layout";
import List from "../components/ui/LIst";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DATA_SEMANAL = [
  { label: "Sem 1", recibidos: 5, resueltos: 20 },
  { label: "Sem 2", recibidos: 35, resueltos: 25 },
  { label: "Sem 3", recibidos: 55, resueltos: 40 },
  { label: "Sem 4", recibidos: 40, resueltos: 50 },
  { label: "Sem 5", recibidos: 60, resueltos: 30 },
];

const DATA_DIARIO = [
  { label: "Lun", recibidos: 8, resueltos: 5 },
  { label: "Mar", recibidos: 15, resueltos: 10 },
  { label: "Mié", recibidos: 12, resueltos: 14 },
  { label: "Jue", recibidos: 20, resueltos: 9 },
  { label: "Vie", recibidos: 18, resueltos: 16 },
];

const INCIDENT_TYPES = [
  { tipo: "Tubería Rota", count: 4 },
  { tipo: "Obstrucción", count: 16 },
  { tipo: "Instalación", count: 5 },
  { tipo: "Fuga", count: 2 },
];

export default function DetallesServicio() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [nombreIncidencia, setNombreIncidencia] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const navigate = useNavigate();
  const [vistaMetrica, setVistaMetrica] = useState<"diario" | "semanal">(
    "semanal",
  );

  const chartData = vistaMetrica === "semanal" ? DATA_SEMANAL : DATA_DIARIO;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* ── Header ── */}
      <div className="mb-6">
        <small className="text-[#0040DF] font-bold tracking-widest text-xs uppercase">
          Administración Central
        </small>
        <h1 className="text-3xl font-bold text-gray-900">Servicio Agua</h1>
      </div>

      {/* ── Section 1: Metrics Row ── */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: "3fr 1fr" }}
      >
        {/* Left card — Incidencias sobre la Temporalidad */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700">
              Incidencias sobre la Temporalidad
            </span>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => setVistaMetrica("diario")}
                className={`px-3 py-1 transition-colors ${
                  vistaMetrica === "diario"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                Diario
              </button>
              <button
                onClick={() => setVistaMetrica("semanal")}
                className={`px-3 py-1 transition-colors ${
                  vistaMetrica === "semanal"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                Semanal
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
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
              <Line
                dataKey="recibidos"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="resueltos"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Right card — Averías Más Comunes */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Averías Más Comunes
          </h3>
          <div className="flex items-center justify-between border-b border-gray-100 py-3">
            <span className="text-sm text-gray-700">Tubería Rota</span>
            <div className="flex items-center">
              <span className="text-xl font-bold text-[#0040DF]">4</span>
              <span className="bg-red-100 text-red-600 text-xs rounded-full px-2 py-0.5 ml-2">
                Crítico
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-700">Obstrucción</span>
            <div className="flex items-center">
              <span className="text-xl font-bold text-[#0040DF]">16</span>
              <span className="bg-yellow-100 text-yellow-600 text-xs rounded-full px-2 py-0.5 ml-2">
                Moderado
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Últimos 30 días</p>
        </div>
      </div>

      {/* ── Section 2: Map + Incident Types ── */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: "3fr 1fr" }}
      >
        {/* Left column — Map */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Mapa de Incidencias
          </h3>
          <div className="h-[380px] rounded-xl overflow-hidden">
            <Map />
          </div>
        </div>

        {/* Right column — Incident Types */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Tipos de Incidencia
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer hover:opacity-70 transition-opacity text-[#0040DF]"
            >
              <CirclePlus size={20} />
            </button>
          </div>
          {INCIDENT_TYPES.map((item) => (
            <div
              key={item.tipo}
              className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-700">{item.tipo}</span>
              <span className="text-sm font-bold text-gray-900">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Incidents list ── */}
      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Lista de Incidencias
        </h2>
        <List
          filters={[
            { field: "estado", label: "Estado", type: "checkbox" },
            { field: "prioridad", label: "Prioridad", type: "checkbox" },
            { field: "tipo", label: "Tipo de Avería", type: "checkbox" },
            { field: "empresa", label: "Buscar empresa", type: "text" },
            { field: "reportante", label: "Buscar reportante", type: "text" },
          ]}
          renderRowId={(id) => (
            <span className="font-mono text-xs" style={{ color: "#64748B" }}>
              #URB-{String(id).padStart(4, "0")}
            </span>
          )}
          columns={[
            {
              key: "empresa",
              header: "Empresa",
              render: (row) => (
                <span className="font-bold text-gray-900">{row.empresa}</span>
              ),
            },
            {
              key: "reportante",
              header: "Reportante",
              render: (row) => (
                <span className="text-gray-700">{row.reportante}</span>
              ),
            },
            {
              key: "tipo",
              header: "Tipo de Avería",
              render: (row) => (
                <span className="text-gray-700">{row.tipo}</span>
              ),
            },
            {
              key: "estado",
              header: "Estado",
              render: (row) => {
                const cfg: Record<
                  string,
                  { label: string; bg: string; color: string }
                > = {
                  Pendiente: {
                    label: "PENDIENTE",
                    bg: "#F1F5F9",
                    color: "#64748B",
                  },
                  "En Proceso": {
                    label: "EN PROCESO",
                    bg: "#FEF3C7",
                    color: "#D97706",
                  },
                  Resuelto: {
                    label: "COMPLETADO",
                    bg: "#DCFCE7",
                    color: "#16A34A",
                  },
                };
                const s = cfg[row.estado] ?? {
                  label: row.estado,
                  bg: "#F1F5F9",
                  color: "#64748B",
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
                const cfg: Record<string, { color: string }> = {
                  Alta: { color: "#EF4444" },
                  Media: { color: "#F97316" },
                  Baja: { color: "#22C55E" },
                };
                const s = cfg[row.prioridad] ?? { color: "#64748B" };
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
            {
              key: "sector",
              header: "Sector",
              render: (row) => (
                <span style={{ color: "#64748B" }}>{row.sector}</span>
              ),
            },
          ]}
          data={[
            {
              id: 1,
              empresa: "Aguas del Norte",
              reportante: "Carlos Pérez",
              tipo: "Tubería Rota",
              estado: "Pendiente",
              prioridad: "Alta",
              sector: "Unare",
            },
            {
              id: 2,
              empresa: "Energía Urbana",
              reportante: "María González",
              tipo: "Obstrucción",
              estado: "En Proceso",
              prioridad: "Media",
              sector: "Sierra Parima",
            },
            {
              id: 3,
              empresa: "Aguas del Norte",
              reportante: "Luis Rodríguez",
              tipo: "Fuga",
              estado: "Pendiente",
              prioridad: "Alta",
              sector: "Unare",
            },
            {
              id: 4,
              empresa: "Metrogas Central",
              reportante: "Ana Martínez",
              tipo: "Instalación",
              estado: "En Proceso",
              prioridad: "Media",
              sector: "Centro",
            },
            {
              id: 5,
              empresa: "Limpieza Regional",
              reportante: "Pedro Sánchez",
              tipo: "Obstrucción",
              estado: "Resuelto",
              prioridad: "Baja",
              sector: "La Llanada",
            },
          ]}
          actions={[{ label: "Ver Detalles", onClick: () => navigate(ROUTES.DETALLES_REPORTE) }]}
        />
      </section>

      {/* ── Modal: Nuevo Tipo de Incidencia ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Tipo de Incidencia"
        confirmText="Registrar"
        cancelText="Cancelar"
        onConfirm={() => {
          setNombreIncidencia("");
          setDescripcion("");
          setIsModalOpen(false);
        }}
      >
        <div className="flex flex-col gap-5">
          {/* NOMBRE DE LA INCIDENCIA */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Nombre de la Incidencia
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF]">
              <Input
                typeInput="text"
                placeholder="Ej. Mantenimiento"
                value={nombreIncidencia}
                onChange={setNombreIncidencia}
                classes="text-sm border-none outline-none bg-transparent p-0 w-full"
              />
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Descripción
            </label>
            <textarea
              rows={3}
              placeholder="Descripción..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF] text-sm w-full outline-none resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
