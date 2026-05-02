import { useEffect, useMemo, useState } from "react";
import { Droplet, Zap, Trash2, CirclePlus } from "lucide-react";
import { Button, Card } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants";
import List, { type FilterConfig } from "../components/ui/LIst";
import type { FilterState } from "../components/ui/ListFilter";
import { reportsService, type BackendReport } from "../services/reports.service";

// ── Types ─────────────────────────────────────────────────────────────────────

type Reporte = {
  id: string | number;
  correlativo: string;
  empresa: string;
  servicio: string;
  tipoAveria: string;
  prioridad: string;
  estado: string;
  sector: string;
  responsable: string;
  creadoPor: string;
};

// ── Config de display usando valores exactos del backend ──────────────────────

function getServicioIcon(name: string): { Icon: typeof Droplet; color: string } | null {
  const n = name.toLowerCase();
  if (n.includes("agua") || n.includes("water"))                          return { Icon: Droplet, color: "#3B82F6" };
  if (n.includes("electric") || n.includes("luz") || n.includes("energ")) return { Icon: Zap,     color: "#EAB308" };
  if (n.includes("aseo") || n.includes("urban") || n.includes("limpieza")) return { Icon: Trash2,  color: "#F97316" };
  return null;
}

const ESTADO_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PENDIENTE:  { label: "PENDIENTE",  bg: "#F1F5F9", color: "#64748B" },
  EN_PROCESO: { label: "EN PROCESO", bg: "#FEF3C7", color: "#D97706" },
  COMPLETADO: { label: "COMPLETADO", bg: "#DCFCE7", color: "#16A34A" },
  CANCELADO:  { label: "CANCELADO",  bg: "#FEE2E2", color: "#DC2626" },
};

const PRIORIDAD_CONFIG: Record<string, { color: string }> = {
  ALTA:  { color: "#EF4444" },
  MEDIA: { color: "#F97316" },
  BAJA:  { color: "#22C55E" },
};

// ── Backend → row mapper ───────────────────────────────────────────────────────

function toReporteRow(r: BackendReport): Reporte {
  return {
    id:          r.id,
    correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
    empresa:     r.company?.name ?? "—",
    servicio:    r.category.name,
    tipoAveria:  r.failureType?.name ?? "—",
    prioridad:   r.priority,
    estado:      r.state.name,
    sector:      r.neighborhood.name,
    responsable: r.assignedManager
      ? `${r.assignedManager.name} ${r.assignedManager.lastname}`
      : "—",
    creadoPor: `${r.user.name} ${r.user.lastname}`,
  };
}

// ── Filters config ────────────────────────────────────────────────────────────

const FILTERS: FilterConfig<Reporte>[] = [
  { field: "servicio",   label: "Servicio",            type: "checkbox" },
  { field: "tipoAveria", label: "Tipo de Avería",      type: "checkbox" },
  { field: "prioridad",  label: "Prioridad",           type: "checkbox" },
  { field: "estado",     label: "Estado",              type: "checkbox" },
  { field: "empresa",    label: "Empresa",             type: "text"     },
  { field: "sector",     label: "Sector",              type: "text"     },
  { field: "responsable",label: "Responsable asignado",type: "text"     },
];

// ── Columns ───────────────────────────────────────────────────────────────────

function buildColumns() {
  return [
    {
      key: "correlativo" as const,
      header: "Correlativo",
      render: (row: Reporte) => (
        <span className="font-mono text-sm font-semibold" style={{ color: "#64748B" }}>
          {row.correlativo}
        </span>
      ),
    },
    {
      key: "empresa" as const,
      header: "Empresa",
      render: (row: Reporte) => (
        <span className="font-bold text-gray-900">{row.empresa}</span>
      ),
    },
    {
      key: "servicio" as const,
      header: "Servicio",
      render: (row: Reporte) => {
        const cfg = getServicioIcon(row.servicio);
        return (
          <div className="flex items-center gap-2">
            {cfg && <cfg.Icon size={16} color={cfg.color} />}
            <span className="text-gray-700">{row.servicio}</span>
          </div>
        );
      },
    },
    {
      key: "tipoAveria" as const,
      header: "Avería",
      render: (row: Reporte) => (
        <span className="text-gray-700">{row.tipoAveria}</span>
      ),
    },
    {
      key: "estado" as const,
      header: "Estado",
      render: (row: Reporte) => {
        const cfg = ESTADO_CONFIG[row.estado] ?? { label: row.estado, bg: "#F1F5F9", color: "#64748B" };
        return (
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "prioridad" as const,
      header: "Prioridad",
      render: (row: Reporte) => {
        const cfg = PRIORIDAD_CONFIG[row.prioridad] ?? { color: "#64748B" };
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
            <span className="font-medium" style={{ color: cfg.color }}>{row.prioridad}</span>
          </div>
        );
      },
    },
    {
      key: "sector" as const,
      header: "Sector",
      render: (row: Reporte) => (
        <span style={{ color: "#64748B" }}>{row.sector}</span>
      ),
    },
  ];
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Reportes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialFilterState = (
    location.state as { initialFilterState?: FilterState } | null
  )?.initialFilterState;

  const [backendReports, setBackendReports] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    let fetch: Promise<BackendReport[]>;
    if (user.role === "citizen") {
      fetch = reportsService.getByUser(user.id).then((res) => res.data.reports);
    } else if (user.role === "worker") {
      fetch = reportsService.getAssigned().then((res) => res.data.reports);
    } else {
      fetch = reportsService.getAll({ limit: 1000 }).then((res) => res.data.reports);
    }

    fetch
      .then((data) => setBackendReports(data))
      .finally(() => setLoading(false));
  }, [user?.id, user?.role]);

  const rows = useMemo(() => backendReports.map(toReporteRow), [backendReports]);

  const stats = useMemo(() => ({
    agua:         backendReports.filter((r) => r.category.name.toLowerCase().includes("agua")).length,
    electricidad: backendReports.filter((r) => r.category.name.toLowerCase().includes("electric") || r.category.name.toLowerCase().includes("luz")).length,
    aseo:         backendReports.filter((r) => r.category.name.toLowerCase().includes("aseo") || r.category.name.toLowerCase().includes("urban")).length,
  }), [backendReports]);

  const viewAction = {
    label: "Ver Detalles",
    onClick: (row: Reporte) =>
      navigate(ROUTES.DETALLES_REPORTE, { state: { reporte: row, mode: "view" } }),
  };

  // ── Admin ──────────────────────────────────────────────────────────────────
  if (user?.role === "admin") {
    const columns = buildColumns();
    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Resumen de Reportes</h1>
          <div className="flex items-center gap-4 justify-between">
            <small>Control y seguimiento de servicios activos</small>
            <Button
              onClick={() => navigate(ROUTES.DETALLES_REPORTE, { state: { mode: "new" } })}
              text="Reporte"
              icon={CirclePlus}
              variant_classes="btn-primary btn-sm w-[150px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card extraClasses="bg-[#DBEAFE] text-[#1E40AF]" title="AGUA"        description={String(stats.agua)}         icon={Droplet} compact />
          <Card extraClasses="bg-[#FEF9C3] text-[#854D0E]" title="ELECTRICIDAD" description={String(stats.electricidad)} icon={Zap}     compact />
          <Card extraClasses="bg-[#DCFCE7] text-[#166534]" title="ASEO URBANO" description={String(stats.aseo)}          icon={Trash2}  compact />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Listado de Incidencias</h2>
          {loading ? (
            <p className="text-sm text-gray-400 py-8 text-center">Cargando reportes...</p>
          ) : (
            <List
              data={rows}
              filters={FILTERS.filter((f) => f.field !== "responsable")}
              initialFilterState={initialFilterState}
              columns={columns}
              actions={[viewAction]}
            />
          )}
        </section>
      </div>
    );
  }

  // ── Company ────────────────────────────────────────────────────────────────
  if (user?.role === "company") {
    const columns = buildColumns();
    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Resumen de Reportes</h1>
          <div className="flex items-center gap-4 justify-between">
            <small>Reportes asignados a tu empresa</small>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card extraClasses="bg-[#DBEAFE] text-[#1E40AF]" title="AGUA"        description={String(stats.agua)}         icon={Droplet} compact />
          <Card extraClasses="bg-[#FEF9C3] text-[#854D0E]" title="ELECTRICIDAD" description={String(stats.electricidad)} icon={Zap}     compact />
          <Card extraClasses="bg-[#DCFCE7] text-[#166534]" title="ASEO URBANO" description={String(stats.aseo)}          icon={Trash2}  compact />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Listado de Incidencias</h2>
          {loading ? (
            <p className="text-sm text-gray-400 py-8 text-center">Cargando reportes...</p>
          ) : (
            <List
              data={rows}
              filters={FILTERS.filter((f) => f.field !== "empresa")}
              initialFilterState={initialFilterState}
              columns={[...columns, { key: "responsable" as const, header: "Responsable" }]}
              actions={[viewAction]}
            />
          )}
        </section>
      </div>
    );
  }

  // ── Worker ─────────────────────────────────────────────────────────────────
  if (user?.role === "worker") {
    const columns = buildColumns();
    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Mis Reportes</h1>
          <small>Reportes asignados a tu cuenta</small>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Listado de Incidencias</h2>
          {loading ? (
            <p className="text-sm text-gray-400 py-8 text-center">Cargando reportes...</p>
          ) : (
            <List
              data={rows}
              filters={FILTERS}
              initialFilterState={initialFilterState}
              columns={columns}
              actions={[viewAction]}
            />
          )}
        </section>
      </div>
    );
  }

  // ── Citizen ────────────────────────────────────────────────────────────────
  if (user?.role === "citizen") {
    const columns = buildColumns();
    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Mis Reportes</h1>
          <div className="flex items-center gap-4 mt-2 justify-between">
            <small>Historial de reportes enviados por ti</small>
            <Button
              onClick={() => navigate(ROUTES.DETALLES_REPORTE, { state: { mode: "new" } })}
              text="Reporte"
              icon={CirclePlus}
              variant_classes="btn-primary btn-sm w-[150px]"
            />
          </div>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Últimas Incidencias</h2>

          {loading && (
            <p className="text-sm text-gray-400 py-8 text-center">Cargando reportes...</p>
          )}

          {!loading && rows.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
              <p className="text-gray-500 font-medium">No tienes reportes creados</p>
              <p className="text-xs text-gray-400 mt-1">Cuando crees un reporte, aparecerá aquí.</p>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <List
              data={rows}
              filters={FILTERS}
              initialFilterState={initialFilterState}
              columns={columns}
              actions={[viewAction]}
            />
          )}
        </section>
      </div>
    );
  }

  return null;
}
