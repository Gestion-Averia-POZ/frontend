import { Droplet, Zap, Trash2, CirclePlus } from "lucide-react";
import { Button, Card } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import List, { type FilterConfig } from "../components/ui/LIst";

// ── Types & shared data ───────────────────────────────────────────────────────

type Reporte = {
  id: number;
  empresa: string;
  servicio: string;
  prioridad: string;
  estado: string;
  sector: string;
  responsable: string;
  creadoPor: string;
};

const DATA: Reporte[] = [
  {
    id: 1,
    empresa: "Empresa X",
    servicio: "Agua",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "Unare",
    responsable: "Carlos López",
    creadoPor: "Admin",
  },
  {
    id: 2,
    empresa: "Empresa Y",
    servicio: "Electricidad",
    prioridad: "Media",
    estado: "Revisión",
    sector: "Sierra Parima",
    responsable: "María García",
    creadoPor: "Supervisor A",
  },
  {
    id: 3,
    empresa: "Empresa X",
    servicio: "Aseo Urbano",
    prioridad: "Baja",
    estado: "Resuelto",
    sector: "Unare",
    responsable: "Luis Martínez",
    creadoPor: "Admin",
  },
  {
    id: 4,
    empresa: "Empresa Z",
    servicio: "Agua",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "La Llanada",
    responsable: "Carlos López",
    creadoPor: "Supervisor B",
  },
  {
    id: 5,
    empresa: "Empresa Y",
    servicio: "Electricidad",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "Sierra Parima",
    responsable: "Ana Torres",
    creadoPor: "Admin",
  },
  {
    id: 6,
    empresa: "Empresa Z",
    servicio: "Aseo Urbano",
    prioridad: "Media",
    estado: "Revisión",
    sector: "La Llanada",
    responsable: "María García",
    creadoPor: "Supervisor A",
  },
  {
    id: 7,
    empresa: "Empresa X",
    servicio: "Electricidad",
    prioridad: "Baja",
    estado: "Resuelto",
    sector: "Unare",
    responsable: "Luis Martínez",
    creadoPor: "Admin",
  },
  {
    id: 8,
    empresa: "Empresa Y",
    servicio: "Agua",
    prioridad: "Media",
    estado: "Revisión",
    sector: "Sierra Parima",
    responsable: "Ana Torres",
    creadoPor: "Supervisor B",
  },
  {
    id: 9,
    empresa: "Empresa Z",
    servicio: "Agua",
    prioridad: "Baja",
    estado: "Resuelto",
    sector: "La Llanada",
    responsable: "Carlos López",
    creadoPor: "Admin",
  },
  {
    id: 10,
    empresa: "Empresa X",
    servicio: "Aseo Urbano",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "Unare",
    responsable: "Ana Torres",
    creadoPor: "Supervisor A",
  },
  {
    id: 11,
    empresa: "Empresa Z",
    servicio: "Agua",
    prioridad: "Baja",
    estado: "Resuelto",
    sector: "La Llanada",
    responsable: "Carlos López",
    creadoPor: "Admin",
  },
  {
    id: 12,
    empresa: "Empresa X",
    servicio: "Aseo Urbano",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "Unare",
    responsable: "Ana Torres",
    creadoPor: "Supervisor A",
  },
];

const FILTERS: FilterConfig<Reporte>[] = [
  { field: "servicio", label: "Servicio", type: "checkbox" },
  { field: "prioridad", label: "Prioridad", type: "checkbox" },
  { field: "estado", label: "Estado", type: "checkbox" },
  { field: "empresa", label: "Empresa", type: "text" },
  { field: "sector", label: "Sector", type: "text" },
  { field: "responsable", label: "Responsable asignado", type: "text" },
  { field: "creadoPor", label: "Creado por", type: "text" },
];

const SERVICIO_CONFIG: Record<
  string,
  { icon: typeof Droplet; color: string; label: string }
> = {
  Agua: { icon: Droplet, color: "#3B82F6", label: "Agua Potable" },
  Electricidad: { icon: Zap, color: "#EAB308", label: "Luz Eléctrica" },
  "Aseo Urbano": { icon: Trash2, color: "#F97316", label: "Aseo Urbano" },
};

const ESTADO_CONFIG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  Pendiente: { label: "PENDIENTE", bg: "#F1F5F9", color: "#64748B" },
  Revisión: { label: "EN PROCESO", bg: "#FEF3C7", color: "#D97706" },
  Resuelto: { label: "COMPLETADO", bg: "#DCFCE7", color: "#16A34A" },
};

const PRIORIDAD_CONFIG: Record<string, { color: string }> = {
  Alta: { color: "#EF4444" },
  Media: { color: "#F97316" },
  Baja: { color: "#22C55E" },
};

// ── Shared columns ────────────────────────────────────────────────────────────

function buildColumns() {
  return [
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
        const cfg = SERVICIO_CONFIG[row.servicio];
        if (!cfg) return <span>{row.servicio}</span>;
        const Icon = cfg.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon size={16} color={cfg.color} />
            <span className="text-gray-700">{cfg.label}</span>
          </div>
        );
      },
    },
    {
      key: "estado" as const,
      header: "Estado",
      render: (row: Reporte) => {
        const cfg = ESTADO_CONFIG[row.estado] ?? {
          label: row.estado,
          bg: "#F1F5F9",
          color: "#64748B",
        };
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
  ];
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Reportes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === "admin" || user?.role === "company") {
    const columns = buildColumns();

    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Resumen de Reportes</h1>
          <div className="flex items-center gap-4 justify-between">
            <small>Control y seguimiento de servicios activos</small>
            <Button
              onClick={() => navigate(ROUTES.DETALLES_REPORTE)}
              text="Reporte"
              icon={CirclePlus}
              variant_classes="btn-primary btn-sm w-[150px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card
            extraClasses="bg-[#DBEAFE] text-[#1E40AF]"
            title="AGUA POTABLE"
            description="14"
            icon={Droplet}
            compact
          />
          <Card
            extraClasses="bg-[#FEF9C3] text-[#854D0E]"
            title="ENERGIA ELECTRICA"
            description="28"
            icon={Zap}
            compact
          />
          <Card
            extraClasses="bg-[#DCFCE7] text-[#166534]"
            title="ASEO URBANO"
            description="09"
            icon={Trash2}
            compact
          />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Últimas Incidencias</h2>
          <List
            data={DATA}
            filters={FILTERS}
            renderRowId={(id) => (
              <span className="font-mono text-xs" style={{ color: "#64748B" }}>
                #URB-{String(id).padStart(4, "0")}
              </span>
            )}
            columns={[
              ...columns,
              { key: "responsable" as const, header: "Responsable" },
              { key: "creadoPor" as const, header: "Creado por" },
            ]}
            actions={[
              {
                label: "Ver Detalles",
                onClick: () => navigate(ROUTES.DETALLES_REPORTE),
              },
            ]}
          />
        </section>
      </div>
    );
  }

  if (user?.role === "worker") {
    const workerData = DATA.filter((r) => r.responsable === "Carlos López");
    const columns = buildColumns();

    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Mis Reportes</h1>
          <div className="flex items-center gap-4 mt-2 justify-between">
            <small>Reportes asignados a tu cuenta</small>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Últimas Incidencias</h2>
          <List
            data={workerData}
            filters={FILTERS}
            renderRowId={(id) => (
              <span className="font-mono text-xs" style={{ color: "#64748B" }}>
                #URB-{String(id).padStart(4, "0")}
              </span>
            )}
            columns={columns}
            actions={[
              {
                label: "Ver Detalles",
                onClick: () => navigate(ROUTES.DETALLES_REPORTE),
              },
            ]}
          />
        </section>
      </div>
    );
  }

  if (user?.role === "citizen") {
    const citizenData = DATA.filter((r) => r.creadoPor === "Admin");
    const columns = buildColumns();

    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Mis Reportes</h1>
          <div className="flex items-center gap-4 mt-2 justify-between">
            <small>Historial de reportes enviados por ti</small>
            <Button
              onClick={() => navigate(ROUTES.DETALLES_REPORTE)}
              text="Reporte"
              icon={CirclePlus}
              variant_classes="btn-primary btn-sm w-[150px]"
            />
          </div>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Últimas Incidencias</h2>
          <List
            data={citizenData}
            filters={FILTERS}
            renderRowId={(id) => (
              <span className="font-mono text-xs" style={{ color: "#64748B" }}>
                #URB-{String(id).padStart(4, "0")}
              </span>
            )}
            columns={columns}
            actions={[
              {
                label: "Ver Detalles",
                onClick: () => navigate(ROUTES.DETALLES_REPORTE),
              },
            ]}
          />
        </section>
      </div>
    );
  }

  return null;
}
