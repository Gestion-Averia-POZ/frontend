import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAllReports, useReportsByUser, useAssignedReports } from "../hooks/useQueryHooks";
import {
  type LucideIcon,
  Droplet,
  Zap,
  Trash2,
  CirclePlus,
  Clock,
  ClipboardCheck,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
} from "lucide-react";
import { Button, Card, ImportCSVModal, LoadingState } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants";
import List, { type FilterConfig } from "../components/ui/LIst";
import type { FilterState } from "../components/ui/ListFilter";
import {
  reportsService,
  type BackendReport,
  type ExportFilters,
} from "../services/reports.service";

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

function getServicioIcon(
  name: string,
): { Icon: typeof Droplet; color: string } | null {
  const n = name.toLowerCase();
  if (n.includes("agua") || n.includes("water"))
    return { Icon: Droplet, color: "#3B82F6" };
  if (n.includes("electric") || n.includes("luz") || n.includes("energ"))
    return { Icon: Zap, color: "#EAB308" };
  if (n.includes("aseo") || n.includes("urban") || n.includes("limpieza"))
    return { Icon: Trash2, color: "#F97316" };
  return null;
}

const ESTADO_CONFIG: Record<
  string,
  { label: string; bg: string; color: string; dot: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    bg: "#F1F5F9",
    color: "#64748B",
    dot: "#94A3B8",
  },
  EN_PROCESO: {
    label: "En Revisión",
    bg: "#FEF3C7",
    color: "#D97706",
    dot: "#D97706",
  },
  COMPLETADO: {
    label: "Completado",
    bg: "#DCFCE7",
    color: "#16A34A",
    dot: "#16A34A",
  },
  CANCELADO: {
    label: "Cancelado",
    bg: "#FEE2E2",
    color: "#DC2626",
    dot: "#DC2626",
  },
};

const PRIORIDAD_CONFIG: Record<string, { color: string }> = {
  ALTA: { color: "#EF4444" },
  MEDIA: { color: "#F97316" },
  BAJA: { color: "#22C55E" },
};

// ── Backend → row mapper ───────────────────────────────────────────────────────

function toReporteRow(r: BackendReport): Reporte {
  return {
    id: r.id,
    correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
    empresa: r.company?.name ?? "—",
    servicio: r.category.name,
    tipoAveria: r.failureType?.name ?? "—",
    prioridad: r.priority,
    estado: r.state.name,
    sector: r.neighborhood.name,
    responsable: r.assignedManager
      ? `${r.assignedManager.name} ${r.assignedManager.lastname}`
      : "—",
    creadoPor: `${r.user.name} ${r.user.lastname}`,
  };
}

// ── Filters config ────────────────────────────────────────────────────────────

const FILTERS: FilterConfig<Reporte>[] = [
  { field: "servicio", label: "Servicio", type: "checkbox" },
  { field: "tipoAveria", label: "Tipo de Avería", type: "checkbox" },
  { field: "prioridad", label: "Prioridad", type: "checkbox" },
  { field: "estado", label: "Estado", type: "checkbox" },
  { field: "empresa", label: "Empresa", type: "text" },
  { field: "sector", label: "Sector", type: "text" },
  { field: "responsable", label: "Responsable asignado", type: "text" },
];

// ── Columns ───────────────────────────────────────────────────────────────────

function buildColumns() {
  return [
    {
      key: "correlativo" as const,
      header: "Correlativo",
      render: (row: Reporte) => (
        <span
          className="font-mono text-sm font-semibold"
          style={{ color: "#64748B" }}
        >
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
        const cfg = ESTADO_CONFIG[row.estado] ?? {
          label: row.estado,
          bg: "#F1F5F9",
          color: "#64748B",
          dot: "#94A3B8",
        };
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: cfg.dot }}
            />
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
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: cfg.color }}
            />
            <span className="font-medium" style={{ color: cfg.color }}>
              {row.prioridad}
            </span>
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
    {
      key: "responsable" as const,
      header: "Responsable",
      render: (row: Reporte) => (
        <span className="text-gray-700 whitespace-nowrap">
          {row.responsable}
        </span>
      ),
    },
  ];
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Reportes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    initialFilterState?: FilterState;
    companyView?: string;
  } | null;
  const initialFilterState = locationState?.initialFilterState;
  const companyView = (locationState?.companyView ?? "dirigidos") as
    | "dirigidos"
    | "propios";

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    checkbox: {},
    text: {},
  });
  const [exporting, setExporting] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const queryClient = useQueryClient();

  // Admin / company → todos los reportes (filtro server-side por companyName cuando aplique)
  const { data: _allReports = [], isLoading: loadingAll } = useAllReports(
    { limit: 1000 },
    user?.role === "admin" || user?.role === "company",
  );
  // Citizen / worker → reportes propios del usuario
  const { data: _userReports = [], isLoading: loadingUser } = useReportsByUser(user?.id ?? "");
  // Worker → reportes asignados
  const { data: workerAssignedReports = [], isLoading: loadingAssigned } = useAssignedReports(user?.role === "worker");

  // Alias que preserva la lógica de memos existente sin cambios
  const backendReports = user?.role === "citizen" ? _userReports : _allReports;
  const workerOwnReports = _userReports;
  const loading = loadingAll || loadingUser || loadingAssigned;

  const displayReports = useMemo(() => {
    if (user?.role !== "company") return backendReports;
    if (companyView === "propios")
      return backendReports.filter((r) => r.user.id === user.id);
    return backendReports.filter((r) => r.company?.name === user?.name);
  }, [backendReports, companyView, user?.role, user?.id, user?.name]);

  const workerDisplayReports = useMemo(() => {
    if (user?.role !== "worker") return [];
    return companyView === "propios" ? workerOwnReports : workerAssignedReports;
  }, [user?.role, companyView, workerOwnReports, workerAssignedReports]);

  const activeReports = useMemo(() => {
    if (user?.role === "company") return displayReports;
    if (user?.role === "worker") return workerDisplayReports;
    return backendReports;
  }, [user?.role, displayReports, workerDisplayReports, backendReports]);

  const rows = useMemo(() => activeReports.map(toReporteRow), [activeReports]);

  const stats = useMemo(
    () => ({
      agua: activeReports.filter((r) =>
        r.category.name.toLowerCase().includes("agua"),
      ).length,
      electricidad: activeReports.filter(
        (r) =>
          r.category.name.toLowerCase().includes("electric") ||
          r.category.name.toLowerCase().includes("luz"),
      ).length,
      aseo: activeReports.filter(
        (r) =>
          r.category.name.toLowerCase().includes("aseo") ||
          r.category.name.toLowerCase().includes("urban"),
      ).length,
    }),
    [activeReports],
  );

  // Worker: status cards
  const workerStatusCards = useMemo(() => {
    if (user?.role !== "worker") return null;
    const counts: Record<string, number> = {};
    workerDisplayReports.forEach((r) => {
      counts[r.state.name] = (counts[r.state.name] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [workerDisplayReports, user?.role]);

  // Company: dynamic service cards by category
  const companyServiceCards = useMemo(() => {
    if (user?.role !== "company") return null;
    const counts: Record<string, number> = {};
    displayReports.forEach((r) => {
      counts[r.category.name] = (counts[r.category.name] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [displayReports, user?.role]);

  function buildExportFilters(fs: FilterState): ExportFilters {
    const { checkbox, text } = fs;
    const p: ExportFilters = {};
    if (checkbox.servicio?.length === 1) p.categoryName = checkbox.servicio[0];
    if (checkbox.tipoAveria?.length === 1)
      p.failureTypeName = checkbox.tipoAveria[0];
    if (checkbox.prioridad?.length === 1)
      p.priority = checkbox.prioridad[0] as ExportFilters["priority"];
    if (checkbox.estado?.length === 1) p.stateName = checkbox.estado[0];
    if (text.empresa) p.companyName = text.empresa;
    if (text.sector) p.neighborhoodName = text.sector;
    if (user?.role === "company" && user?.name) p.companyName = user.name;
    return p;
  }

  async function handleExport() {
    setExporting(true);
    try {
      await reportsService.exportToExcel(buildExportFilters(activeFilters));
    } catch (err) {
      console.error("Error al exportar:", err);
    } finally {
      setExporting(false);
    }
  }

  const viewAction = {
    label: "Ver Detalles",
    onClick: (row: Reporte) => {
      const full = activeReports.find((r) => r.id === row.id);
      if (!full) return;
      navigate(ROUTES.DETALLES_REPORTE, {
        state: {
          reporte: {
            id: full.id,
            correlativo: `#URB-${full.id.slice(0, 8).toUpperCase()}`,
            empresa: full.company?.name ?? "—",
            servicio: full.category.name,
            categoryId: full.category.id,
            tipoAveria: full.failureType?.name ?? "—",
            prioridad: full.priority,
            estado: full.state.name,
            sector: full.neighborhood.name,
            responsable: full.assignedManager
              ? `${full.assignedManager.name} ${full.assignedManager.lastname}`
              : "",
            creadoPor: `${full.user.name} ${full.user.lastname}`,
            telefonoCreador: full.user.phoneNumber ?? "",
            descripcion: full.description,
            address: full.address ?? "",
            latitude: full.latitude,
            longitude: full.longitude,
            createdAt: full.createdAt,
          },
          mode: "view",
          ...(user?.role === "company" && { companyView }),
        },
      });
    },
  };

  // ── Admin ──────────────────────────────────────────────────────────────────
  if (user?.role === "admin") {
    const columns = buildColumns().filter((c) => c.key !== "responsable");
    return (
      <>
      <ImportCSVModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type="reports"
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["reports", "all"] })}
      />
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Resumen de Reportes</h1>
          <div className="flex items-center gap-4 justify-between">
            <small>Control y seguimiento de servicios activos</small>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsImportOpen(true)}
                text="Importar"
                icon={Upload}
                variant_classes="btn-outline btn-sm"
              />
              <Button
                onClick={handleExport}
                text={exporting ? "Exportando..." : "Exportar Excel"}
                icon={Download}
                variant_classes="btn-success btn-sm text-white"
                disabled={exporting}
              />
              <Button
                onClick={() =>
                  navigate(ROUTES.DETALLES_REPORTE, { state: { mode: "new" } })
                }
                text="Reporte"
                icon={CirclePlus}
                variant_classes="btn-primary btn-sm w-[150px]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card
            extraClasses="bg-[#DBEAFE] text-[#1E40AF]"
            title="AGUA"
            description={String(stats.agua)}
            icon={Droplet}
            compact
          />
          <Card
            extraClasses="bg-[#FEF9C3] text-[#854D0E]"
            title="ELECTRICIDAD"
            description={String(stats.electricidad)}
            icon={Zap}
            compact
          />
          <Card
            extraClasses="bg-[#DCFCE7] text-[#166534]"
            title="ASEO URBANO"
            description={String(stats.aseo)}
            icon={Trash2}
            compact
          />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">
            Listado de Incidencias
          </h2>
          {loading ? (
            <LoadingState message="Cargando reportes…" />
          ) : (
            <List
              data={rows}
              filters={FILTERS.filter((f) => f.field !== "responsable")}
              initialFilterState={initialFilterState}
              columns={columns}
              actions={[viewAction]}
              onFilterChange={setActiveFilters}
            />
          )}
        </section>
      </div>
      </>
    );
  }

  // ── Company ────────────────────────────────────────────────────────────────
  if (user?.role === "company") {
    const companyCols = buildColumns().filter((c) => c.key !== "empresa");

    return (
      <>
      <ImportCSVModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type="reports"
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["reports", "all"] })}
      />
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Resumen de Reportes</h1>
          <div className="flex items-center gap-4 mt-1 justify-between">
            <div className="flex items-center gap-2">
              {(["dirigidos", "propios"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    navigate(ROUTES.REPORTES, { state: { companyView: v } })
                  }
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    companyView === v
                      ? "bg-[#1e293b] text-white border-[#1e293b]"
                      : "bg-white text-[#1e293b] border-[#cbd5e1] hover:bg-[#f1f5f9]"
                  }`}
                >
                  {v === "dirigidos" ? "Reportes Dirigidos" : "Mis Reportes"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ">
              <Button
                onClick={() => setIsImportOpen(true)}
                text="Importar"
                icon={Upload}
                variant_classes="btn-outline btn-sm"
              />
              <Button
                onClick={handleExport}
                text={exporting ? "Exportando..." : "Exportar Excel"}
                icon={Download}
                variant_classes="btn-success btn-sm text-white"
                disabled={exporting}
              />
              <Button
                onClick={() =>
                  navigate(ROUTES.DETALLES_REPORTE, { state: { mode: "new" } })
                }
                text="Reporte"
                icon={CirclePlus}
                variant_classes="btn-primary btn-sm w-[150px]"
              />
            </div>
          </div>
        </div>

        {companyServiceCards && companyServiceCards.length > 0 && (
          <div
            className={`grid gap-4 mt-4`}
            style={{
              gridTemplateColumns: `repeat(${Math.min(companyServiceCards.length, 4)}, 1fr)`,
            }}
          >
            {companyServiceCards.map(([catName, count]) => {
              const cfg = getServicioIcon(catName);
              return (
                <Card
                  key={catName}
                  extraClasses={
                    cfg?.color === "#3B82F6"
                      ? "bg-[#DBEAFE] text-[#1E40AF]"
                      : cfg?.color === "#EAB308"
                        ? "bg-[#FEF9C3] text-[#854D0E]"
                        : "bg-[#DCFCE7] text-[#166534]"
                  }
                  title={catName.toUpperCase()}
                  description={String(count)}
                  icon={cfg?.Icon ?? Droplet}
                  compact
                />
              );
            })}
          </div>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">
            Listado de Incidencias
          </h2>
          {loading ? (
            <LoadingState message="Cargando reportes…" />
          ) : (
            <List
              data={rows}
              filters={FILTERS.filter((f) => f.field !== "empresa")}
              initialFilterState={initialFilterState}
              columns={companyCols}
              actions={[viewAction]}
              onFilterChange={setActiveFilters}
            />
          )}
        </section>
      </div>
      </>
    );
  }

  // ── Worker ─────────────────────────────────────────────────────────────────
  if (user?.role === "worker") {
    const workerCols = buildColumns().filter((c) => c.key !== "responsable");

    const STATE_CARD_CONFIG: Record<
      string,
      { extraClasses: string; icon: LucideIcon }
    > = {
      PENDIENTE: {
        extraClasses: "bg-[#F1F5F9] text-[#475569]",
        icon: AlertTriangle,
      },
      EN_PROCESO: { extraClasses: "bg-[#FEF3C7] text-[#854D0E]", icon: Clock },
      COMPLETADO: {
        extraClasses: "bg-[#DCFCE7] text-[#166534]",
        icon: ClipboardCheck,
      },
      CANCELADO: { extraClasses: "bg-[#FEE2E2] text-[#991B1B]", icon: XCircle },
    };

    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Resumen de Reportes</h1>
          <div className="flex items-center gap-4 mt-1 justify-between">
            <div className="flex items-center gap-2">
              {(["dirigidos", "propios"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    navigate(ROUTES.REPORTES, { state: { companyView: v } })
                  }
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    companyView === v
                      ? "bg-[#1e293b] text-white border-[#1e293b]"
                      : "bg-white text-[#1e293b] border-[#cbd5e1] hover:bg-[#f1f5f9]"
                  }`}
                >
                  {v === "dirigidos" ? "Reportes Dirigidos" : "Mis Reportes"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExport}
                text={exporting ? "Exportando..." : "Exportar Excel"}
                icon={Download}
                variant_classes="btn-success btn-sm text-white"
                disabled={exporting}
              />
              <Button
                onClick={() =>
                  navigate(ROUTES.DETALLES_REPORTE, { state: { mode: "new" } })
                }
                text="Reporte"
                icon={CirclePlus}
                variant_classes="btn-primary btn-sm w-[150px]"
              />
            </div>
          </div>
        </div>

        {workerStatusCards && workerStatusCards.length > 0 && (
          <div
            className="grid gap-4 mt-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(workerStatusCards.length, 4)}, 1fr)`,
            }}
          >
            {workerStatusCards.map(([stateName, count]) => {
              const cfg: { extraClasses: string; icon: LucideIcon } =
                STATE_CARD_CONFIG[stateName] ?? {
                  extraClasses: "bg-[#F1F5F9] text-[#475569]",
                  icon: AlertTriangle,
                };
              const label = ESTADO_CONFIG[stateName]?.label ?? stateName;
              return (
                <Card
                  key={stateName}
                  extraClasses={cfg.extraClasses}
                  title={label}
                  description={String(count)}
                  icon={cfg.icon}
                  compact
                />
              );
            })}
          </div>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">
            Listado de Incidencias
          </h2>
          {loading ? (
            <LoadingState message="Cargando reportes…" />
          ) : (
            <List
              data={rows}
              filters={FILTERS.filter((f) => f.field !== "responsable")}
              initialFilterState={initialFilterState}
              columns={workerCols}
              actions={[viewAction]}
              onFilterChange={setActiveFilters}
            />
          )}
        </section>
      </div>
    );
  }

  // ── Citizen ────────────────────────────────────────────────────────────────
  if (user?.role === "citizen") {
    const columns = buildColumns().filter((c) => c.key !== "responsable");
    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Mis Reportes</h1>
          <div className="flex items-center gap-4 mt-2 justify-between">
            <small>Historial de reportes enviados por ti</small>
            <Button
              onClick={() =>
                navigate(ROUTES.DETALLES_REPORTE, { state: { mode: "new" } })
              }
              text="Reporte"
              icon={CirclePlus}
              variant_classes="btn-primary btn-sm w-[150px]"
            />
          </div>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Últimas Incidencias</h2>

          {loading && <LoadingState message="Cargando reportes…" />}

          {!loading && rows.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
              <p className="text-gray-500 font-medium">
                No tienes reportes creados
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Cuando crees un reporte, aparecerá aquí.
              </p>
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
