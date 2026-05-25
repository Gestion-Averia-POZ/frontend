import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Map } from "../../../components/layout";
import List from "../../../components/ui/LIst";
import { LoadingState } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { ROUTES } from "../../../constants";
import type { BackendReport } from "../../../services/reports.service";
import { useReportsByUser } from "../../../hooks/useQueryHooks";

// ── Badge config alineado con estados del backend ─────────────────────────────

const ESTADO_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  PENDIENTE:  { bg: "#F1F5F9", color: "#64748B", label: "PENDIENTE"  },
  EN_PROCESO: { bg: "#FEF3C7", color: "#D97706", label: "EN PROCESO" },
  COMPLETADO: { bg: "#DCFCE7", color: "#16A34A", label: "COMPLETADO" },
  CANCELADO:  { bg: "#FEE2E2", color: "#DC2626", label: "CANCELADO"  },
};

const PRIORIDAD_CONFIG: Record<string, { color: string }> = {
  ALTA:  { color: "#EF4444" },
  MEDIA: { color: "#F97316" },
  BAJA:  { color: "#22C55E" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type ReporteRow = {
  id: string;
  correlativo: string;
  tipo: string;
  servicio: string;
  sector: string;
  estado: string;
  prioridad: string;
  fecha: string;
};

function toRow(r: BackendReport): ReporteRow {
  return {
    id:          r.id,
    correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
    tipo:        r.failureType?.name ?? "—",
    servicio:    r.category.name,
    sector:      r.neighborhood.name,
    estado:      r.state.name,
    prioridad:   r.priority,
    fecha:       formatDate(r.createdAt),
  };
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: number;
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

export default function DashboardCitizen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: reports = [], isLoading: loading, isError } = useReportsByUser(user?.id ?? "");

  const rows = useMemo(() => reports.map(toRow), [reports]);

  const stats = useMemo(
    () => ({
      total:      reports.length,
      completados: reports.filter((r) => r.state.name === "COMPLETADO").length,
      en_proceso:  reports.filter((r) => r.state.name === "EN_PROCESO").length,
      pendientes:  reports.filter((r) => r.state.name === "PENDIENTE").length,
    }),
    [reports]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0040DF] mb-1">
          Panel de Ciudadano
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Seguimiento de tus reportes enviados.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Reportes"
          value={stats.total}
          sub="Reportes enviados"
        />
        <StatCard
          label="Atendidos"
          value={stats.completados}
          sub="Resueltos satisfactoriamente"
          valueColor="#16A34A"
        />
        <StatCard
          label="En Revisión"
          value={stats.en_proceso}
          sub="En proceso de atención"
          valueColor="#D97706"
        />
        <StatCard
          label="Pendientes"
          value={stats.pendientes}
          sub="Esperando atención"
          valueColor="#EF4444"
        />
      </div>

      {/* Map */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Mapa de incidencias
        </h3>
        <div className="h-[380px] rounded-xl overflow-hidden">
          <Map />
        </div>
      </div>

      {/* Reports list */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Reportes</h2>

        {loading && <LoadingState message="Cargando reportes…" />}

        {!loading && isError && (
          <p className="text-sm text-red-500 py-8 text-center">Error al cargar reportes</p>
        )}

        {!loading && !isError && rows.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
            <p className="text-gray-500 font-medium">
              No tienes reportes creados
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Cuando crees un reporte, aparecerá aquí.
            </p>
          </div>
        )}

        {!loading && !isError && rows.length > 0 && (
          <List
            data={rows}
            filters={[
              { field: "estado",    label: "Estado",         type: "checkbox" },
              { field: "prioridad", label: "Prioridad",      type: "checkbox" },
              { field: "servicio",  label: "Servicio",       type: "checkbox" },
              { field: "sector",    label: "Buscar sector",  type: "text"     },
            ]}
            columns={[
              {
                key: "correlativo",
                header: "N° Reporte",
                render: (row) => (
                  <span className="font-mono text-xs text-gray-400">{row.correlativo}</span>
                ),
              },
              {
                key: "servicio",
                header: "Servicio",
                render: (row) => (
                  <span className="font-semibold text-gray-900">{row.servicio}</span>
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
                  const s = PRIORIDAD_CONFIG[row.prioridad] ?? { color: "#64748B" };
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
                onClick: (row) => {
                  const r = reports.find((rep) => rep.id === row.id);
                  if (!r) return;
                  navigate(ROUTES.DETALLES_REPORTE, {
                    state: {
                      mode: "view",
                      reporte: {
                        id:          r.id,
                        correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
                        empresa:     r.company?.name ?? "—",
                        servicio:    r.category.name,
                        categoryId:  r.category.id,
                        tipoAveria:  r.failureType?.name ?? "—",
                        prioridad:   r.priority,
                        estado:      r.state.name,
                        sector:      r.neighborhood?.name ?? "—",
                        responsable: r.assignedManager
                          ? `${r.assignedManager.name} ${r.assignedManager.lastname}`
                          : "",
                        creadoPor:   `${r.user.name} ${r.user.lastname}`,
                        descripcion: r.description,
                        address:     r.address ?? "",
                        latitude:    r.latitude,
                        longitude:   r.longitude,
                        createdAt:   r.createdAt,
                      },
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
