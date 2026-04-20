import { Droplet, Zap, Trash2, CirclePlus } from "lucide-react";
import { Button, Card } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants";
import List, { type FilterConfig } from "../components/ui/LIst";
import type { FilterState } from "../components/ui/ListFilter";

// ── Types & shared data ───────────────────────────────────────────────────────

type Reporte = {
  id: number;
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

const DATA: Reporte[] = [
  {
    id: 1,
    correlativo: "#A-00001",
    empresa: "Empresa X",
    servicio: "Agua",
    tipoAveria: "Fuga",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "Unare",
    responsable: "Carlos López",
    creadoPor: "Admin",
  },
  {
    id: 2,
    correlativo: "#L-00001",
    empresa: "Empresa Y",
    servicio: "Electricidad",
    tipoAveria: "Corte de Suministro",
    prioridad: "Media",
    estado: "Revisión",
    sector: "Sierra Parima",
    responsable: "María García",
    creadoPor: "Supervisor A",
  },
  {
    id: 3,
    correlativo: "#U-00001",
    empresa: "Empresa X",
    servicio: "Aseo Urbano",
    tipoAveria: "Acumulación de Desechos",
    prioridad: "Baja",
    estado: "Resuelto",
    sector: "Unare",
    responsable: "Luis Martínez",
    creadoPor: "Admin",
  },
  {
    id: 4,
    correlativo: "#A-00002",
    empresa: "Empresa Z",
    servicio: "Agua",
    tipoAveria: "Tubería Rota",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "La Llanada",
    responsable: "Carlos López",
    creadoPor: "Supervisor B",
  },
  {
    id: 5,
    correlativo: "#L-00002",
    empresa: "Empresa Y",
    servicio: "Electricidad",
    tipoAveria: "Falla en Transformador",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "Sierra Parima",
    responsable: "Ana Torres",
    creadoPor: "Admin",
  },
  {
    id: 6,
    correlativo: "#U-00002",
    empresa: "Empresa Z",
    servicio: "Aseo Urbano",
    tipoAveria: "Acumulación de Desechos",
    prioridad: "Media",
    estado: "Revisión",
    sector: "La Llanada",
    responsable: "María García",
    creadoPor: "Supervisor A",
  },
  {
    id: 7,
    correlativo: "#L-00003",
    empresa: "Empresa X",
    servicio: "Electricidad",
    tipoAveria: "Corte de Suministro",
    prioridad: "Baja",
    estado: "Resuelto",
    sector: "Unare",
    responsable: "Luis Martínez",
    creadoPor: "Admin",
  },
  {
    id: 8,
    correlativo: "#A-00003",
    empresa: "Empresa Y",
    servicio: "Agua",
    tipoAveria: "Obstrucción",
    prioridad: "Media",
    estado: "Revisión",
    sector: "Sierra Parima",
    responsable: "Ana Torres",
    creadoPor: "Supervisor B",
  },
  {
    id: 9,
    correlativo: "#A-00004",
    empresa: "Empresa Z",
    servicio: "Agua",
    tipoAveria: "Fuga",
    prioridad: "Baja",
    estado: "Resuelto",
    sector: "La Llanada",
    responsable: "Carlos López",
    creadoPor: "Admin",
  },
  {
    id: 10,
    correlativo: "#U-00003",
    empresa: "Empresa X",
    servicio: "Aseo Urbano",
    tipoAveria: "Acumulación de Desechos",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "Unare",
    responsable: "Ana Torres",
    creadoPor: "Supervisor A",
  },
  {
    id: 11,
    correlativo: "#A-00005",
    empresa: "Empresa Z",
    servicio: "Agua",
    tipoAveria: "Tubería Rota",
    prioridad: "Baja",
    estado: "Resuelto",
    sector: "La Llanada",
    responsable: "Carlos López",
    creadoPor: "Admin",
  },
  {
    id: 12,
    correlativo: "#U-00004",
    empresa: "Empresa X",
    servicio: "Aseo Urbano",
    tipoAveria: "Acumulación de Desechos",
    prioridad: "Alta",
    estado: "Pendiente",
    sector: "Unare",
    responsable: "Ana Torres",
    creadoPor: "Supervisor A",
  },
  // Electricidad – Unare (marcador 1: total 6, alta 3, media 2, baja 1)
  { id: 13, correlativo: "#L-00004", empresa: "Empresa Y", servicio: "Electricidad", tipoAveria: "Corte de Suministro",    prioridad: "Alta",  estado: "Pendiente",  sector: "Unare",         responsable: "Carlos López",  creadoPor: "Admin"       },
  { id: 14, correlativo: "#L-00005", empresa: "Empresa Y", servicio: "Electricidad", tipoAveria: "Cable Caído",            prioridad: "Alta",  estado: "Revisión",   sector: "Unare",         responsable: "María García",  creadoPor: "Supervisor A" },
  { id: 15, correlativo: "#L-00006", empresa: "Empresa Y", servicio: "Electricidad", tipoAveria: "Transformador Dañado",   prioridad: "Alta",  estado: "Pendiente",  sector: "Unare",         responsable: "Luis Martínez", creadoPor: "Admin"       },
  { id: 16, correlativo: "#L-00007", empresa: "Empresa Y", servicio: "Electricidad", tipoAveria: "Corte de Suministro",    prioridad: "Media", estado: "Revisión",   sector: "Unare",         responsable: "Ana Torres",    creadoPor: "Supervisor B" },
  { id: 17, correlativo: "#L-00008", empresa: "Empresa Y", servicio: "Electricidad", tipoAveria: "Alumbrado Fundido",      prioridad: "Media", estado: "En Proceso", sector: "Unare",         responsable: "Carlos López",  creadoPor: "Admin"       },
  // Electricidad – Centro (marcador 3: total 3, alta 1, media 1, baja 1)
  { id: 18, correlativo: "#L-00009", empresa: "Empresa Z", servicio: "Electricidad", tipoAveria: "Corte de Suministro",    prioridad: "Alta",  estado: "Pendiente",  sector: "Centro",        responsable: "María García",  creadoPor: "Admin"       },
  { id: 19, correlativo: "#L-00010", empresa: "Empresa Z", servicio: "Electricidad", tipoAveria: "Alumbrado Fundido",      prioridad: "Media", estado: "Revisión",   sector: "Centro",        responsable: "Ana Torres",    creadoPor: "Supervisor A" },
  { id: 20, correlativo: "#L-00011", empresa: "Empresa Z", servicio: "Electricidad", tipoAveria: "Cable Caído",            prioridad: "Baja",  estado: "Resuelto",   sector: "Centro",        responsable: "Luis Martínez", creadoPor: "Admin"       },
  // Electricidad – La Llanada (marcador 4: total 2, alta 1, baja 1)
  { id: 21, correlativo: "#L-00012", empresa: "Empresa Y", servicio: "Electricidad", tipoAveria: "Transformador Dañado",   prioridad: "Alta",  estado: "Pendiente",  sector: "La Llanada",    responsable: "Carlos López",  creadoPor: "Supervisor B" },
  { id: 22, correlativo: "#L-00013", empresa: "Empresa Y", servicio: "Electricidad", tipoAveria: "Alumbrado Fundido",      prioridad: "Baja",  estado: "Resuelto",   sector: "La Llanada",    responsable: "Luis Martínez", creadoPor: "Admin"       },
  // Agua – Sierra Parima (marcador 5: total 3, alta 1, media 1, baja 1)
  { id: 23, correlativo: "#A-00006", empresa: "Empresa X", servicio: "Agua",          tipoAveria: "Tubería Rota",           prioridad: "Alta",  estado: "Pendiente",  sector: "Sierra Parima", responsable: "Ana Torres",    creadoPor: "Admin"       },
  { id: 24, correlativo: "#A-00007", empresa: "Empresa X", servicio: "Agua",          tipoAveria: "Fuga",                   prioridad: "Baja",  estado: "Resuelto",   sector: "Sierra Parima", responsable: "Carlos López",  creadoPor: "Supervisor A" },
  // Agua – Centro (marcador 6: total 2, alta 1, media 1)
  { id: 25, correlativo: "#A-00008", empresa: "Empresa Z", servicio: "Agua",          tipoAveria: "Fuga",                   prioridad: "Alta",  estado: "Pendiente",  sector: "Centro",        responsable: "María García",  creadoPor: "Admin"       },
  { id: 26, correlativo: "#A-00009", empresa: "Empresa Z", servicio: "Agua",          tipoAveria: "Obstrucción",            prioridad: "Media", estado: "Revisión",   sector: "Centro",        responsable: "Ana Torres",    creadoPor: "Supervisor B" },
];

// Contadores actuales por categoría (para generar el siguiente correlativo)
const COUNTERS = {
  A: DATA.filter((r) => r.servicio === "Agua").length,
  L: DATA.filter((r) => r.servicio === "Electricidad").length,
  U: DATA.filter((r) => r.servicio === "Aseo Urbano").length,
};

const FILTERS: FilterConfig<Reporte>[] = [
  { field: "servicio", label: "Servicio", type: "checkbox" },
  { field: "tipoAveria", label: "Tipo de Avería", type: "checkbox" },
  { field: "prioridad", label: "Prioridad", type: "checkbox" },
  { field: "estado", label: "Estado", type: "checkbox" },
  { field: "empresa", label: "Empresa", type: "text" },
  { field: "sector", label: "Sector", type: "text" },
  { field: "responsable", label: "Responsable asignado", type: "text" },
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
  const location = useLocation();
  const initialFilterState = (
    location.state as { initialFilterState?: FilterState } | null
  )?.initialFilterState;

  if (user?.role === "admin") {
    const columns = buildColumns();

    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Resumen de Reportes</h1>
          <div className="flex items-center gap-4 justify-between">
            <small>Control y seguimiento de servicios activos</small>
            <Button
              onClick={() =>
                navigate(ROUTES.DETALLES_REPORTE, {
                  state: { mode: "new", counters: COUNTERS },
                })
              }
              text="Reporte"
              icon={CirclePlus}
              variant_classes="btn-primary btn-sm w-[150px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card extraClasses="bg-[#DBEAFE] text-[#1E40AF]" title="AGUA POTABLE" description="14" icon={Droplet} compact />
          <Card extraClasses="bg-[#FEF9C3] text-[#854D0E]" title="ENERGIA ELECTRICA" description="28" icon={Zap} compact />
          <Card extraClasses="bg-[#DCFCE7] text-[#166534]" title="ASEO URBANO" description="09" icon={Trash2} compact />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Listado de Incidencias</h2>
          <List
            data={DATA}
            filters={FILTERS.filter((f) => f.field !== "responsable")}
            initialFilterState={initialFilterState}
            renderRowId={(id) => (
              <span className="font-mono text-xs" style={{ color: "#64748B" }}>
                #URB-{String(id).padStart(4, "0")}
              </span>
            )}
            columns={columns}
            actions={[
              {
                label: "Ver Detalles",
                onClick: (row) =>
                  navigate(ROUTES.DETALLES_REPORTE, { state: { reporte: row, mode: "view" } }),
              },
            ]}
          />
        </section>
      </div>
    );
  }

  if (user?.role === "company") {
    const empresaNombre = user.empresa ?? "";
    const categorias = user.categorias ?? [];
    const companyData = DATA.filter(
      (r) => r.empresa === empresaNombre && categorias.includes(r.servicio)
    );
    const columns = buildColumns();

    const CARD_CONFIG: Record<string, { title: string; extraClasses: string; icon: typeof Droplet }> = {
      Agua:          { title: "AGUA POTABLE",    extraClasses: "bg-[#DBEAFE] text-[#1E40AF]", icon: Droplet },
      Electricidad:  { title: "ENERGIA ELECTRICA", extraClasses: "bg-[#FEF9C3] text-[#854D0E]", icon: Zap },
      "Aseo Urbano": { title: "ASEO URBANO",     extraClasses: "bg-[#DCFCE7] text-[#166534]", icon: Trash2 },
    };

    return (
      <div className="max-w-6xl mx-auto px-2 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Resumen de Reportes</h1>
          <div className="flex items-center gap-4 justify-between">
            <small>Reportes asignados a {empresaNombre}</small>
            <Button
              onClick={() =>
                navigate(ROUTES.DETALLES_REPORTE, { state: { mode: "new", counters: COUNTERS } })
              }
              text="Reporte"
              icon={CirclePlus}
              variant_classes="btn-primary btn-sm w-[150px]"
            />
          </div>
        </div>

        <div className={`grid gap-4 mt-4`} style={{ gridTemplateColumns: `repeat(${categorias.length}, 1fr)` }}>
          {categorias.map((cat) => {
            const cfg = CARD_CONFIG[cat];
            if (!cfg) return null;
            const count = companyData.filter((r) => r.servicio === cat).length;
            return (
              <Card
                key={cat}
                extraClasses={cfg.extraClasses}
                title={cfg.title}
                description={String(count).padStart(2, "0")}
                icon={cfg.icon}
                compact
              />
            );
          })}
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Listado de Incidencias</h2>
          <List
            data={companyData}
            filters={FILTERS.filter((f) => f.field !== "empresa")}
            initialFilterState={initialFilterState}
            renderRowId={(id) => (
              <span className="font-mono text-xs" style={{ color: "#64748B" }}>
                #URB-{String(id).padStart(4, "0")}
              </span>
            )}
            columns={[...columns, { key: "responsable" as const, header: "Responsable" }]}
            actions={[
              {
                label: "Ver Detalles",
                onClick: (row) =>
                  navigate(ROUTES.DETALLES_REPORTE, { state: { reporte: row, mode: "view" } }),
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
          <h2 className="mb-4 text-2xl font-semibold">
            Listado de Incidencias
          </h2>
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
                onClick: (row) =>
                  navigate(ROUTES.DETALLES_REPORTE, {
                    state: { reporte: row, mode: "view" },
                  }),
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
              onClick={() =>
                navigate(ROUTES.DETALLES_REPORTE, {
                  state: { mode: "new", counters: COUNTERS },
                })
              }
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
                onClick: (row) =>
                  navigate(ROUTES.DETALLES_REPORTE, {
                    state: { reporte: row, mode: "view" },
                  }),
              },
            ]}
          />
        </section>
      </div>
    );
  }

  return null;
}
