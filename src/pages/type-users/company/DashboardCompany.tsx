import { useMemo, useState } from "react";
import { ClipboardCheck, AlertTriangle, Files, TrendingUp } from "lucide-react";
import List, { type FilterConfig } from "../../../components/ui/LIst";
import { LoadingState, Spinner } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Map } from "../../../components/layout";
import type { BackendReport } from "../../../services/reports.service";
import { ROUTES } from "../../../constants";
import { useAllReports } from "../../../hooks/useQueryHooks";

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
      <span className="text-3xl font-bold" style={{ color: valueColor ?? "#111827" }}>
        {value}
      </span>
      <span className="text-xs text-gray-400">{sub}</span>
    </div>
  );
}

// ── Row type for recent reports list ─────────────────────────────────────────

type RecentRow = {
  id: string;
  correlativo: string;
  tipo: string;
  servicio: string;
  sector: string;
  estado: string;
};

const ESTADO_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  PENDIENTE:  { label: "Pendiente",   bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" },
  EN_PROCESO: { label: "En Revisión", bg: "#FEF3C7", color: "#D97706", dot: "#D97706" },
  COMPLETADO: { label: "Completado",  bg: "#DCFCE7", color: "#16A34A", dot: "#16A34A" },
  CANCELADO:  { label: "Cancelado",   bg: "#FEE2E2", color: "#DC2626", dot: "#DC2626" },
};

function toRecentRow(r: BackendReport): RecentRow {
  return {
    id: r.id,
    correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
    tipo: r.failureType?.name ?? "—",
    servicio: r.category.name,
    sector: r.neighborhood.name,
    estado: r.state.name,
  };
}

const RECENT_FILTERS: FilterConfig<RecentRow>[] = [
  { field: "estado",   label: "Estado",          type: "checkbox" },
  { field: "servicio", label: "Servicio",         type: "checkbox" },
  { field: "sector",   label: "Buscar sector",    type: "text"     },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardCompany() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mapMode, setMapMode] = useState<"global" | "empresa">("empresa");

  // Filtrado en servidor por companyName → evita descargar todos los reportes
  const { data: companyReports = [], isLoading: loading } = useAllReports(
    { companyName: user?.name, limit: 1000 },
    !!user?.name,
  );

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const now = new Date();
    const monthReports = companyReports.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const completadoMes = monthReports.filter((r) => r.state.name === "COMPLETADO").length;
    const canceladoMes  = monthReports.filter((r) => r.state.name === "CANCELADO").length;
    const efectivaMes   = monthReports.length - canceladoMes;
    const eficiencia    = efectivaMes > 0 ? Math.round((completadoMes / efectivaMes) * 100) : null;

    return {
      total:      companyReports.length,
      atendidos:  companyReports.filter((r) => r.state.name === "COMPLETADO").length,
      sinAtender: companyReports.filter((r) => r.state.name === "PENDIENTE" || r.state.name === "EN_PROCESO").length,
      eficiencia,
    };
  }, [companyReports]);

  // ── Incident types (top 8 by count) ───────────────────────────────────────

  const incidenceTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    companyReports.forEach((r) => {
      const name = r.failureType?.name;
      if (name) counts[name] = (counts[name] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [companyReports]);

  // ── Recent reports (last 5) ────────────────────────────────────────────────

  const recentRows = useMemo(
    () =>
      [...companyReports]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(toRecentRow),
    [companyReports]
  );

  // Also keep the full BackendReport list for "Ver Detalles" navigation
  const recentBackend = useMemo(
    () =>
      [...companyReports]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [companyReports]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0040DF] mb-1">
            Panel de Empresa
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Resumen de actividad y reportes de tu empresa.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Reportes"
          value={loading ? "—" : String(stats.total)}
          sub="Histórico acumulado"
          icon={Files}
        />
        <StatCard
          label="Atendidos"
          value={loading ? "—" : String(stats.atendidos)}
          sub="Reportes completados"
          icon={ClipboardCheck}
          valueColor="#0040DF"
        />
        <StatCard
          label="Sin Atender"
          value={loading ? "—" : String(stats.sinAtender)}
          sub="Pendientes o en proceso"
          icon={AlertTriangle}
          valueColor="#EF4444"
        />
        <StatCard
          label="Eficiencia del Mes"
          value={loading ? "—" : stats.eficiencia !== null ? `${stats.eficiencia}%` : "—"}
          sub={stats.eficiencia !== null ? "Completados / efectivos" : "Sin reportes este mes"}
          icon={TrendingUp}
          valueColor="#16A34A"
        />
      </div>

      {/* Map toggle */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-gray-600">Vista del mapa:</span>
        {(["empresa", "global"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setMapMode(mode)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              mapMode === mode
                ? "bg-[#1e293b] text-white border-[#1e293b]"
                : "bg-white text-[#1e293b] border-[#cbd5e1] hover:bg-[#f1f5f9]"
            }`}
          >
            {mode === "empresa" ? "Mi Empresa" : "Vista Global"}
          </button>
        ))}
      </div>

      {/* Map + Incident Types */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "3fr 1fr" }}>
        {/* Left — Mapa de Incidencias */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Mapa de Incidencias
          </h3>
          <div className="h-[380px] rounded-xl overflow-hidden">
            {mapMode === "empresa" ? (
              <Map externalReports={companyReports} />
            ) : (
              <Map />
            )}
          </div>
        </div>

        {/* Right — Tipos de Incidencia */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Tipos de Incidencia
          </h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner className="text-primary" />
            </div>
          ) : incidenceTypes.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Sin datos</p>
          ) : (
            <div className="flex flex-col">
              {incidenceTypes.map(([tipo, count]) => (
                <div
                  key={tipo}
                  className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-700">{tipo}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Reportes Recientes</h2>
        </div>
        {loading ? (
          <LoadingState message="Cargando reportes…" />
        ) : (
          <List
            data={recentRows}
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
                render: (row) => <span className="text-gray-700">{row.servicio}</span>,
              },
              {
                key: "sector" as const,
                header: "Sector",
                render: (row) => <span className="text-gray-500">{row.sector}</span>,
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
            ]}
            actions={[
              {
                label: "Ver Detalles",
                onClick: (row) => {
                  const full = recentBackend.find((r) => r.id === row.id);
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
                      companyView: "dirigidos",
                    },
                  });
                },
              },
            ]}
            itemsPerPage={5}
          />
        )}
      </div>
    </div>
  );
}
