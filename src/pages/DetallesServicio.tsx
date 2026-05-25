import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CirclePlus, ArrowLeft } from "lucide-react";
import { ROUTES } from "../constants";
import { Input, Modal, Spinner } from "../components/ui";
import { Map } from "../components/layout";
import List from "../components/ui/LIst";
import { type BackendReport } from "../services/reports.service";
import { catalogService } from "../services/catalog.service";
import { useAllReports, useFailureTypesByCategory, queryKeys } from "../hooks/useQueryHooks";
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
  id: string;
  name: string;
  bg: string;
  text: string;
  accent: string;
}

// ── Chart helpers ─────────────────────────────────────────────────────────────

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function buildDailyData(reports: BackendReport[]) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dayStr = d.toISOString().slice(0, 10);
    const dayReports = reports.filter((r) => r.createdAt.slice(0, 10) === dayStr);
    return {
      label: DAY_LABELS[d.getDay()],
      recibidos: dayReports.length,
      resueltos: dayReports.filter((r) => r.state.name === "COMPLETADO").length,
    };
  });
}

function buildWeeklyData(reports: BackendReport[]) {
  const today = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - (4 - i) * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const weekReports = reports.filter((r) => {
      const d = new Date(r.createdAt);
      return d >= weekStart && d <= weekEnd;
    });
    return {
      label: `Sem ${i + 1}`,
      recibidos: weekReports.length,
      resueltos: weekReports.filter((r) => r.state.name === "COMPLETADO").length,
    };
  });
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

const PRIORITY_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  CRITICA: { label: "Crítico",  bg: "#FEE2E2", color: "#DC2626" },
  ALTA:    { label: "Crítico",  bg: "#FEE2E2", color: "#DC2626" },
  MEDIA:   { label: "Moderado", bg: "#FEF3C7", color: "#D97706" },
  BAJA:    { label: "Normal",   bg: "#DCFCE7", color: "#16A34A" },
};

const ESTADO_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  PENDIENTE:  { label: "PENDIENTE",  bg: "#F1F5F9", color: "#64748B" },
  EN_PROCESO: { label: "EN PROCESO", bg: "#FEF3C7", color: "#D97706" },
  COMPLETADO: { label: "COMPLETADO", bg: "#DCFCE7", color: "#16A34A" },
  CANCELADO:  { label: "CANCELADO",  bg: "#FEE2E2", color: "#DC2626" },
};

const PRIORITY_DOT: Record<string, { color: string; label: string }> = {
  ALTA:  { color: "#EF4444", label: "Alta"  },
  MEDIA: { color: "#F97316", label: "Media" },
  BAJA:  { color: "#22C55E", label: "Baja"  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DetallesServicio() {
  const navigate = useNavigate();
  const location = useLocation();

  const servicio = (location.state as { servicio?: ServicioState } | null)?.servicio ?? null;
  const serviceName = servicio?.name ?? "";

  const queryClient = useQueryClient();
  const { data: reports = [], isLoading: loadingReports } = useAllReports(
    { categoryName: serviceName, limit: 1000 },
    !!servicio?.id,
  );
  const { data: failureTypes = [], isLoading: loadingFt } = useFailureTypesByCategory(servicio?.id ?? "");
  const isLoading = loadingReports || loadingFt;

  const [vistaMetrica, setVistaMetrica] = useState<"diario" | "semanal">("semanal");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreIncidencia, setNombreIncidencia] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [priority, setPriority] = useState("MEDIA");
  const [isSaving, setIsSaving] = useState(false);

  // ── Computed ────────────────────────────────────────────────────────────────

  const chartData =
    vistaMetrica === "semanal" ? buildWeeklyData(reports) : buildDailyData(reports);

  const ftWithCount = failureTypes.map((ft) => ({
    ...ft,
    count: reports.filter((r) => r.failureType?.id === ft.id).length,
  }));

  const topFailureTypes = [...ftWithCount].sort((a, b) => b.count - a.count).slice(0, 2);

  const tableData = reports.map((r) => ({
    id: r.id,
    empresa: r.company?.name ?? "—",
    reportante: `${r.user.name} ${r.user.lastname}`,
    tipo: r.failureType?.name ?? "—",
    estado: r.state.name,
    prioridad: r.priority,
    sector: r.neighborhood?.name ?? "—",
    _raw: r,
  }));

  // ── Modal handlers ───────────────────────────────────────────────────────────

  function resetModal() {
    setNombreIncidencia("");
    setDescripcion("");
    setPriority("MEDIA");
  }

  async function handleConfirmModal() {
    if (!nombreIncidencia.trim() || !servicio?.id) return;
    setIsSaving(true);
    try {
      await catalogService.createFailureType({
        name: nombreIncidencia.trim(),
        description: descripcion.trim() || undefined,
        priority,
        categoryId: servicio.id,
      });
      setIsModalOpen(false);
      resetModal();
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog.failureTypesByCategory(servicio!.id) });
    } catch {
      // silent
    } finally {
      setIsSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

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
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "3fr 1fr" }}>
        {/* Left — Incidencias sobre la Temporalidad */}
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
          {isLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <Spinner size="lg" className="text-primary" />
            </div>
          ) : (
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
                <Line dataKey="recibidos" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line dataKey="resueltos" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Right — Averías Más Comunes */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Averías Más Comunes</h3>
          {isLoading ? (
            <p className="text-xs text-gray-400">Cargando...</p>
          ) : topFailureTypes.length === 0 ? (
            <p className="text-xs text-gray-400">Sin datos</p>
          ) : (
            topFailureTypes.map((item, idx) => {
              const badge = PRIORITY_BADGE[item.priority] ?? PRIORITY_BADGE.BAJA;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between py-3 ${idx < topFailureTypes.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-[#0040DF]">{item.count}</span>
                    <span
                      className="text-xs rounded-full px-2 py-0.5 ml-2 font-medium"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Section 2: Map + Incident Types ── */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "3fr 1fr" }}>
        {/* Left — Map */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Mapa de Incidencias</h3>
          <div className="h-[380px] rounded-xl">
            <Map externalReports={reports} />
          </div>
        </div>

        {/* Right — Tipos de Incidencia */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Tipos de Incidencia</h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer hover:opacity-70 transition-opacity text-[#0040DF]"
            >
              <CirclePlus size={20} />
            </button>
          </div>
          {isLoading ? (
            <p className="text-xs text-gray-400">Cargando...</p>
          ) : ftWithCount.length === 0 ? (
            <p className="text-xs text-gray-400">Sin tipos registrados</p>
          ) : (
            ftWithCount.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Section 3: Incidents list ── */}
      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lista de Incidencias</h2>
        <List
          filters={[
            { field: "estado",     label: "Estado",            type: "checkbox" },
            { field: "prioridad",  label: "Prioridad",         type: "checkbox" },
            { field: "tipo",       label: "Tipo de Avería",    type: "checkbox" },
            { field: "empresa",    label: "Buscar empresa",    type: "text"     },
            { field: "reportante", label: "Buscar reportante", type: "text"     },
          ]}
          renderRowId={(id) => (
            <span className="font-mono text-xs" style={{ color: "#64748B" }}>
              #{String(id).slice(0, 8).toUpperCase()}
            </span>
          )}
          columns={[
            {
              key: "empresa",
              header: "Empresa",
              render: (row) => <span className="font-bold text-gray-900">{row.empresa}</span>,
            },
            {
              key: "reportante",
              header: "Reportante",
              render: (row) => <span className="text-gray-700">{row.reportante}</span>,
            },
            {
              key: "tipo",
              header: "Tipo de Avería",
              render: (row) => <span className="text-gray-700">{row.tipo}</span>,
            },
            {
              key: "estado",
              header: "Estado",
              render: (row) => {
                const s = ESTADO_BADGE[row.estado] ?? { label: row.estado, bg: "#F1F5F9", color: "#64748B" };
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
                const s = PRIORITY_DOT[row.prioridad] ?? { color: "#64748B", label: row.prioridad };
                return (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="font-medium" style={{ color: s.color }}>{s.label}</span>
                  </div>
                );
              },
            },
            {
              key: "sector",
              header: "Sector",
              render: (row) => <span style={{ color: "#64748B" }}>{row.sector}</span>,
            },
          ]}
          data={tableData}
          actions={[
            {
              label: "Ver Detalles",
              onClick: (row) => {
                const r = row._raw as BackendReport;
                navigate(ROUTES.DETALLES_REPORTE, {
                  state: {
                    reporte: {
                      id: r.id,
                      correlativo: `#${r.id.slice(0, 8).toUpperCase()}`,
                      empresa: r.company?.name ?? "—",
                      servicio: r.category.name,
                      categoryId: r.category.id,
                      tipoAveria: r.failureType?.name ?? "—",
                      prioridad: r.priority,
                      estado: r.state.name,
                      sector: r.neighborhood?.name ?? "—",
                      responsable: r.assignedManager
                        ? `${r.assignedManager.name} ${r.assignedManager.lastname}`
                        : "—",
                      creadoPor: `${r.user.name} ${r.user.lastname}`,
                      descripcion: r.description,
                      address: r.address ?? undefined,
                      latitude: r.latitude,
                      longitude: r.longitude,
                      createdAt: r.createdAt,
                    },
                    mode: "view",
                  },
                });
              },
            },
          ]}
        />
      </section>

      {/* ── Modal: Nuevo Tipo de Incidencia ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetModal();
        }}
        title="Nuevo Tipo de Incidencia"
        confirmText={isSaving ? "Guardando..." : "Registrar"}
        cancelText="Cancelar"
        onConfirm={handleConfirmModal}
      >
        <div className="flex flex-col gap-5">
          {/* Nombre */}
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

          {/* Prioridad */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Prioridad
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF] text-sm outline-none text-gray-700"
            >
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
            </select>
          </div>

          {/* Descripción */}
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
