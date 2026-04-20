import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CirclePlus, ArrowLeft } from "lucide-react";
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServicioState {
  name: string;
  subtitle: string;
  iconColor: string;
  cardBg: string;
}

// ── Chart data ────────────────────────────────────────────────────────────────

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

// ── Per-service mock data ─────────────────────────────────────────────────────

const SERVICE_DATA: Record<string, {
  incidentTypes: { tipo: string; count: number; badge: string; badgeBg: string; badgeColor: string }[];
  incidencias: { id: number; empresa: string; reportante: string; tipo: string; estado: string; prioridad: string; sector: string }[];
}> = {
  "Agua": {
    incidentTypes: [
      { tipo: "Tubería Rota",  count: 4,  badge: "Crítico",  badgeBg: "#FEE2E2", badgeColor: "#DC2626" },
      { tipo: "Obstrucción",   count: 16, badge: "Moderado", badgeBg: "#FEF3C7", badgeColor: "#D97706" },
      { tipo: "Fuga",          count: 8,  badge: "Moderado", badgeBg: "#FEF3C7", badgeColor: "#D97706" },
      { tipo: "Instalación",   count: 5,  badge: "Normal",   badgeBg: "#DCFCE7", badgeColor: "#16A34A" },
    ],
    incidencias: [
      { id: 1, empresa: "Aguas del Norte", reportante: "Carlos Pérez",   tipo: "Tubería Rota", estado: "Pendiente",  prioridad: "Alta",  sector: "Unare"         },
      { id: 2, empresa: "Aguas del Norte", reportante: "María González",  tipo: "Obstrucción",  estado: "En Proceso", prioridad: "Media", sector: "Sierra Parima" },
      { id: 3, empresa: "Aguas del Norte", reportante: "Luis Rodríguez",  tipo: "Fuga",         estado: "Pendiente",  prioridad: "Alta",  sector: "Unare"         },
      { id: 4, empresa: "Aguas del Norte", reportante: "Ana Martínez",    tipo: "Instalación",  estado: "En Proceso", prioridad: "Media", sector: "Centro"        },
      { id: 5, empresa: "Aguas del Norte", reportante: "Pedro Sánchez",   tipo: "Obstrucción",  estado: "Resuelto",   prioridad: "Baja",  sector: "La Llanada"    },
    ],
  },
  "Electricidad": {
    incidentTypes: [
      { tipo: "Corte de Suministro",    count: 9,  badge: "Crítico",  badgeBg: "#FEE2E2", badgeColor: "#DC2626" },
      { tipo: "Falla en Transformador", count: 3,  badge: "Crítico",  badgeBg: "#FEE2E2", badgeColor: "#DC2626" },
      { tipo: "Alumbrado Fundido",      count: 12, badge: "Moderado", badgeBg: "#FEF3C7", badgeColor: "#D97706" },
    ],
    incidencias: [
      { id: 1, empresa: "Energía Urbana",  reportante: "Roberto Díaz",     tipo: "Corte de Suministro",    estado: "Pendiente",  prioridad: "Alta",  sector: "Centro"        },
      { id: 2, empresa: "Energía Urbana",  reportante: "Gabriela Sánchez", tipo: "Falla en Transformador", estado: "En Proceso", prioridad: "Alta",  sector: "Sierra Parima" },
      { id: 3, empresa: "Metrogas Central",reportante: "Carlos Pérez",     tipo: "Alumbrado Fundido",      estado: "Resuelto",   prioridad: "Baja",  sector: "Unare"         },
    ],
  },
  "Aseo Urbano": {
    incidentTypes: [
      { tipo: "Acumulación de Desechos", count: 21, badge: "Crítico",  badgeBg: "#FEE2E2", badgeColor: "#DC2626" },
      { tipo: "Contenedor Dañado",       count: 7,  badge: "Moderado", badgeBg: "#FEF3C7", badgeColor: "#D97706" },
      { tipo: "Ruta Omitida",            count: 4,  badge: "Normal",   badgeBg: "#DCFCE7", badgeColor: "#16A34A" },
    ],
    incidencias: [
      { id: 1, empresa: "Limpieza Regional", reportante: "Ana Martínez",   tipo: "Acumulación de Desechos", estado: "Pendiente",  prioridad: "Alta",  sector: "La Llanada" },
      { id: 2, empresa: "Limpieza Regional", reportante: "Pedro Sánchez",  tipo: "Contenedor Dañado",       estado: "En Proceso", prioridad: "Media", sector: "Unare"      },
      { id: 3, empresa: "Limpieza Regional", reportante: "María González", tipo: "Ruta Omitida",            estado: "Resuelto",   prioridad: "Baja",  sector: "Centro"     },
    ],
  },
};

const DEFAULT_SERVICE_DATA = SERVICE_DATA["Agua"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function DetallesServicio() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreIncidencia, setNombreIncidencia] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [vistaMetrica, setVistaMetrica] = useState<"diario" | "semanal">("semanal");

  const servicio = (location.state as { servicio?: ServicioState } | null)?.servicio;
  const serviceName = servicio?.name ?? "Agua";
  const serviceData = SERVICE_DATA[serviceName] ?? DEFAULT_SERVICE_DATA;

  const chartData = vistaMetrica === "semanal" ? DATA_SEMANAL : DATA_DIARIO;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* ── Back button ── */}
      <button
        onClick={() => navigate(ROUTES.SERVICIOS)}
        className="flex items-center gap-1.5 text-sm text-[#0040DF] font-medium hover:opacity-70 transition-opacity mb-3 cursor-pointer"
      >
        <ArrowLeft size={15} />
        Regresar a Servicios
      </button>

      {/* ── Header ── */}
      <div className="mb-6">
        <small className="text-[#0040DF] font-bold tracking-widest text-xs uppercase">
          Administración Central
        </small>
        <h1 className="text-3xl font-bold text-gray-900">Servicio {serviceName}</h1>
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
          {serviceData.incidentTypes.slice(0, 2).map((item, idx) => (
            <div
              key={item.tipo}
              className={`flex items-center justify-between py-3 ${idx < 1 ? "border-b border-gray-100" : ""}`}
            >
              <span className="text-sm text-gray-700">{item.tipo}</span>
              <div className="flex items-center">
                <span className="text-xl font-bold text-[#0040DF]">{item.count}</span>
                <span
                  className="text-xs rounded-full px-2 py-0.5 ml-2 font-medium"
                  style={{ backgroundColor: item.badgeBg, color: item.badgeColor }}
                >
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
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
          <div className="h-[380px] rounded-xl">
            <Map servicio={serviceName} />
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
          {serviceData.incidentTypes.map((item) => (
            <div
              key={item.tipo}
              className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-700">{item.tipo}</span>
              <span className="text-sm font-bold text-gray-900">{item.count}</span>
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
            { field: "estado",      label: "Estado",            type: "checkbox" },
            { field: "prioridad",   label: "Prioridad",         type: "checkbox" },
            { field: "tipo",        label: "Tipo de Avería",    type: "checkbox" },
            { field: "empresa",     label: "Buscar empresa",    type: "text"     },
            { field: "reportante",  label: "Buscar reportante", type: "text"     },
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
                const cfg: Record<string, { label: string; bg: string; color: string }> = {
                  Pendiente:   { label: "PENDIENTE",  bg: "#F1F5F9", color: "#64748B" },
                  "En Proceso":{ label: "EN PROCESO", bg: "#FEF3C7", color: "#D97706" },
                  Resuelto:    { label: "COMPLETADO", bg: "#DCFCE7", color: "#16A34A" },
                };
                const s = cfg[row.estado] ?? { label: row.estado, bg: "#F1F5F9", color: "#64748B" };
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
                  Alta:  { color: "#EF4444" },
                  Media: { color: "#F97316" },
                  Baja:  { color: "#22C55E" },
                };
                const s = cfg[row.prioridad] ?? { color: "#64748B" };
                return (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="font-medium" style={{ color: s.color }}>{row.prioridad}</span>
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
          data={serviceData.incidencias}
          actions={[
            {
              label: "Ver Detalles",
              onClick: (row) =>
                navigate(ROUTES.DETALLES_REPORTE, {
                  state: {
                    reporte: {
                      id: row.id,
                      correlativo: `#URB-${String(row.id).padStart(4, "0")}`,
                      empresa: row.empresa,
                      servicio: serviceName,
                      prioridad: row.prioridad,
                      estado: row.estado,
                      sector: row.sector,
                      responsable: "",
                      creadoPor: row.reportante,
                    },
                    mode: "view",
                  },
                }),
            },
          ]}
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
