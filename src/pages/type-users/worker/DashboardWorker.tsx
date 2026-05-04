import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  AlertTriangle,
  Files,
  XCircle,
  Clock,
} from "lucide-react";
import { Map } from "../../../components/layout";
import List, { type FilterConfig } from "../../../components/ui/LIst";
import { useAuth } from "../../../context/AuthContext";
import { ROUTES } from "../../../constants";
import {
  reportsService,
  type BackendReport,
} from "../../../services/reports.service";

// ── Types ─────────────────────────────────────────────────────────────────────

type RecentRow = {
  id: string;
  correlativo: string;
  tipo: string;
  servicio: string;
  sector: string;
  estado: string;
  prioridad: string;
};

// ── Config ────────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  PENDIENTE:  { label: "Pendiente",   bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" },
  EN_PROCESO: { label: "En Revisión", bg: "#FEF3C7", color: "#D97706", dot: "#D97706" },
  COMPLETADO: { label: "Completado",  bg: "#DCFCE7", color: "#16A34A", dot: "#16A34A" },
  CANCELADO:  { label: "Cancelado",   bg: "#FEE2E2", color: "#DC2626", dot: "#DC2626" },
};

const PRIORIDAD_CONFIG: Record<string, { color: string }> = {
  ALTA:  { color: "#EF4444" },
  MEDIA: { color: "#F97316" },
  BAJA:  { color: "#22C55E" },
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  valueColor?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </span>
        <Icon size={18} color={valueColor ?? "#94A3B8"} />
      </div>
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

// ── Row mapper ────────────────────────────────────────────────────────────────

function toRecentRow(r: BackendReport): RecentRow {
  return {
    id:          r.id,
    correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
    tipo:        r.failureType?.name ?? "—",
    servicio:    r.category.name,
    sector:      r.neighborhood.name,
    estado:      r.state.name,
    prioridad:   r.priority,
  };
}

const RECENT_FILTERS: FilterConfig<RecentRow>[] = [
  { field: "estado",    label: "Estado",       type: "checkbox" },
  { field: "servicio",  label: "Servicio",     type: "checkbox" },
  { field: "prioridad", label: "Prioridad",    type: "checkbox" },
  { field: "sector",    label: "Buscar sector", type: "text"    },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardWorker() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignedReports, setAssignedReports] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState<"asignados" | "global">("asignados");

  useEffect(() => {
    if (!user?.id) return;
    reportsService
      .getAssigned()
      .then((res) => setAssignedReports(res.data.reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const stats = useMemo(
    () => ({
      total:      assignedReports.length,
      pendiente:  assignedReports.filter((r) => r.state.name === "PENDIENTE").length,
      enProceso:  assignedReports.filter((r) => r.state.name === "EN_PROCESO").length,
      completado: assignedReports.filter((r) => r.state.name === "COMPLETADO").length,
      cancelado:  assignedReports.filter((r) => r.state.name === "CANCELADO").length,
    }),
    [assignedReports],
  );

  const rows = useMemo(() => assignedReports.map(toRecentRow), [assignedReports]);

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
      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total"
          value={loading ? "—" : String(stats.total)}
          sub="Reportes asignados"
          icon={Files}
        />
        <StatCard
          label="Pendiente"
          value={loading ? "—" : String(stats.pendiente)}
          sub="Sin iniciar"
          icon={AlertTriangle}
          valueColor="#64748B"
        />
        <StatCard
          label="En Proceso"
          value={loading ? "—" : String(stats.enProceso)}
          sub="En atención"
          icon={Clock}
          valueColor="#D97706"
        />
        <StatCard
          label="Completado"
          value={loading ? "—" : String(stats.completado)}
          sub="Finalizados"
          icon={ClipboardCheck}
          valueColor="#0040DF"
        />
        <StatCard
          label="Cancelado"
          value={loading ? "—" : String(stats.cancelado)}
          sub="No realizados"
          icon={XCircle}
          valueColor="#EF4444"
        />
      </div>

      {/* Map toggle */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-gray-600">
          Vista del mapa:
        </span>
        {(["asignados", "global"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setMapMode(mode)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              mapMode === mode
                ? "bg-[#1e293b] text-white border-[#1e293b]"
                : "bg-white text-[#1e293b] border-[#cbd5e1] hover:bg-[#f1f5f9]"
            }`}
          >
            {mode === "asignados" ? "Reportes Asignados" : "Vista Global"}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Mapa de Reportes
        </h3>
        <div className="h-[380px] rounded-xl overflow-hidden">
          {mapMode === "asignados" ? (
            <Map externalReports={assignedReports} />
          ) : (
            <Map />
          )}
        </div>
      </div>

      {/* Reports list */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Reportes</h2>
        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            Cargando reportes...
          </p>
        ) : (
          <List
            data={rows}
            filters={RECENT_FILTERS}
            columns={[
              {
                key: "correlativo" as const,
                header: "Correlativo",
                render: (row) => (
                  <span className="font-mono text-xs font-semibold text-gray-500">
                    {row.correlativo}
                  </span>
                ),
              },
              {
                key: "tipo" as const,
                header: "Tipo de Avería",
                render: (row) => (
                  <span className="font-semibold text-gray-900">{row.tipo}</span>
                ),
              },
              {
                key: "servicio" as const,
                header: "Servicio",
                render: (row) => (
                  <span className="text-gray-700">{row.servicio}</span>
                ),
              },
              {
                key: "sector" as const,
                header: "Sector",
                render: (row) => (
                  <span className="text-gray-500">{row.sector}</span>
                ),
              },
              {
                key: "estado" as const,
                header: "Estado",
                render: (row) => {
                  const cfg = ESTADO_CONFIG[row.estado] ?? { label: row.estado, bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" };
                  return (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                      {cfg.label}
                    </span>
                  );
                },
              },
              {
                key: "prioridad" as const,
                header: "Prioridad",
                render: (row) => {
                  const cfg = PRIORIDAD_CONFIG[row.prioridad] ?? {
                    color: "#64748B",
                  };
                  return (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <span
                        className="font-medium"
                        style={{ color: cfg.color }}
                      >
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
                onClick: (row) => {
                  const full = assignedReports.find((r) => r.id === row.id);
                  if (!full) return;
                  navigate(ROUTES.DETALLES_REPORTE, {
                    state: {
                      reporte: {
                        id:          full.id,
                        correlativo: `#URB-${full.id.slice(0, 8).toUpperCase()}`,
                        empresa:     full.company?.name ?? "—",
                        servicio:    full.category.name,
                        categoryId:  full.category.id,
                        tipoAveria:  full.failureType?.name ?? "—",
                        prioridad:   full.priority,
                        estado:      full.state.name,
                        sector:      full.neighborhood.name,
                        responsable: full.assignedManager
                          ? `${full.assignedManager.name} ${full.assignedManager.lastname}`
                          : "",
                        creadoPor:   `${full.user.name} ${full.user.lastname}`,
                        descripcion: full.description,
                        address:     full.address ?? "",
                        latitude:    full.latitude,
                        longitude:   full.longitude,
                        createdAt:   full.createdAt,
                      },
                      mode: "view",
                    },
                  });
                },
              },
            ]}
            itemsPerPage={5}
          />
        )}
      </section>
    </div>
  );
}
