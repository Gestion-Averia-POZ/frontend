import {
  Files,
  AlertTriangle,
  ClipboardCheck,
  Droplet,
  Zap,
  Trash2,
  LayoutGrid,
} from "lucide-react";
import { Map } from "../../../components/layout";
import List from "../../../components/ui/LIst";
import { LoadingState } from "../../../components/ui";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants";
import type { BackendReport } from "../../../services/reports.service";
import type { LucideIcon } from "lucide-react";
import { useAllReports } from "../../../hooks/useQueryHooks";

function AdminStatCard({
  label,
  value,
  icon: Icon,
  bg,
  textColor,
  onClick,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  bg: string;
  textColor: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2 cursor-pointer hover:brightness-95 transition-all"
      style={{ backgroundColor: bg, color: textColor }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest opacity-70">
          {label}
        </span>
        <Icon size={18} className="opacity-30" />
      </div>
      <span className="text-3xl font-bold">{value}</span>
    </div>
  );
}

const SERVICE_ICON_CFG: Record<string, { icon: typeof Droplet; color: string; label: string }> = {
  Agua: { icon: Droplet, color: "#3B82F6", label: "Agua Potable" },
  Electricidad: { icon: Zap, color: "#EAB308", label: "Luz Eléctrica" },
  "Aseo Urbano": { icon: Trash2, color: "#F97316", label: "Aseo Urbano" },
};

const STATE_CFG: Record<string, { label: string; bg: string; color: string }> = {
  PENDIENTE: { label: "PENDIENTE", bg: "#F1F5F9", color: "#64748B" },
  EN_PROCESO: { label: "EN PROCESO", bg: "#FEF3C7", color: "#D97706" },
  COMPLETADO: { label: "COMPLETADO", bg: "#DCFCE7", color: "#16A34A" },
  CANCELADO: { label: "CANCELADO", bg: "#FEE2E2", color: "#DC2626" },
};

const PRIORITY_CFG: Record<string, { color: string }> = {
  ALTA: { color: "#EF4444" },
  MEDIA: { color: "#F97316" },
  BAJA: { color: "#22C55E" },
};

function getTopCategories(reports: BackendReport[], n: number): string[] {
  const counts: Record<string, number> = {};
  for (const r of reports) {
    counts[r.category.name] = (counts[r.category.name] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name]) => name);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: reports = [], isLoading } = useAllReports({ limit: 500 });

  const total = reports.length;
  const sinAtender = reports.filter((r) => r.state.name === "PENDIENTE").length;
  const atendidos = reports.filter((r) => r.state.name === "COMPLETADO").length;
  const topCategories = getTopCategories(reports, 2);
  const fallasPrincipalesLabel = topCategories.length ? topCategories.join(" / ") : "—";

  const latestReports = reports.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-2">
      <section id="Resumen" className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Resumen del Sistema</h1>
        <small>Panel de control con resumen de las averías de la ciudad</small>

        <div className="grid grid-cols-4 gap-4">
          <AdminStatCard
            label="Total de Reportes"
            value={isLoading ? "..." : String(total)}
            icon={Files}
            bg="#DBEAFE"
            textColor="#1E40AF"
            onClick={() => navigate(ROUTES.REPORTES)}
          />
          <AdminStatCard
            label="Reportes sin Atender"
            value={isLoading ? "..." : String(sinAtender)}
            icon={AlertTriangle}
            bg="#FEF9C3"
            textColor="#854D0E"
            onClick={() =>
              navigate(ROUTES.REPORTES, {
                state: {
                  initialFilterState: {
                    checkbox: { estado: ["PENDIENTE"] },
                    text: {},
                  },
                },
              })
            }
          />
          <AdminStatCard
            label="Reportes Atendidos"
            value={isLoading ? "..." : String(atendidos)}
            icon={ClipboardCheck}
            bg="#DCFCE7"
            textColor="#166534"
            onClick={() =>
              navigate(ROUTES.REPORTES, {
                state: {
                  initialFilterState: {
                    checkbox: { estado: ["COMPLETADO"] },
                    text: {},
                  },
                },
              })
            }
          />
          <AdminStatCard
            label="Fallas Principales"
            value={isLoading ? "..." : fallasPrincipalesLabel}
            icon={LayoutGrid}
            bg="#FCA5A5"
            textColor="#7F1D1D"
            onClick={() =>
              navigate(ROUTES.REPORTES, {
                state: {
                  initialFilterState: {
                    checkbox: {
                      servicio: topCategories.length ? topCategories : [],
                    },
                    text: {},
                  },
                },
              })
            }
          />
        </div>
      </section>

      <section id="Mapa" className="mt-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Mapa de Incidencias
          </h3>
          <div className="h-[500px] rounded-xl overflow-hidden">
            <Map />
          </div>
        </div>
      </section>

      <section id="Ultimas-incidencias" className="mt-15">
        <h2 className="mb-2 text-2xl font-semibold">Últimas Incidencias</h2>
        {isLoading ? (
          <LoadingState message="Cargando reportes…" />
        ) : (
        <List
          renderRowId={(id) => (
            <span className="font-mono text-xs" style={{ color: "#64748B" }}>
              #URB-{String(id).slice(0, 8).toUpperCase()}
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
              key: "servicio",
              header: "Servicio",
              render: (row) => {
                const s = SERVICE_ICON_CFG[row.servicio];
                if (!s) return <span className="text-gray-700">{row.servicio}</span>;
                const Icon = s.icon;
                return (
                  <div className="flex items-center gap-2">
                    <Icon size={16} color={s.color} />
                    <span className="text-gray-700">{row.servicio}</span>
                  </div>
                );
              },
            },
            {
              key: "estado",
              header: "Estado",
              render: (row) => {
                const s = STATE_CFG[row.estado] ?? {
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
                const s = PRIORITY_CFG[row.prioridad] ?? { color: "#64748B" };
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
          data={latestReports.map((r) => ({
            id: r.id,
            empresa: r.company?.name ?? "—",
            servicio: r.category.name,
            prioridad: r.priority,
            estado: r.state.name,
            sector: r.neighborhood?.name ?? "—",
          }))}
          actions={[
            {
              label: "Ver Detalles",
              onClick: (row) => {
                const report = latestReports.find((r) => r.id === row.id);
                if (!report) return;
                navigate(ROUTES.DETALLES_REPORTE, {
                  state: {
                    reporte: {
                      id: report.id,
                      correlativo: `#URB-${report.id.slice(0, 8).toUpperCase()}`,
                      empresa: report.company?.name ?? "—",
                      servicio: report.category.name,
                      categoryId: report.category.id,
                      tipoAveria: report.failureType?.name ?? "—",
                      prioridad: report.priority,
                      estado: report.state.name,
                      sector: report.neighborhood?.name ?? "—",
                      responsable: report.assignedManager
                        ? `${report.assignedManager.name} ${report.assignedManager.lastname}`
                        : "",
                      creadoPor: `${report.user.name} ${report.user.lastname}`,
                      descripcion: report.description,
                      address: report.address ?? "",
                      latitude: report.latitude,
                      longitude: report.longitude,
                      createdAt: report.createdAt,
                    },
                    mode: "view",
                  },
                });
              },
            },
          ]}
        />
        )}
      </section>
    </div>
  );
}
