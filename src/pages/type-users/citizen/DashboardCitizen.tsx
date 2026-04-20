import { useNavigate } from "react-router-dom";
import { Map } from "../../../components/layout";
import List from "../../../components/ui/LIst";
import { useAuth } from "../../../context/AuthContext";
import { ROUTES } from "../../../constants";

// ── Mock data ─────────────────────────────────────────────────────────────────

const REPORTES_DATA = [
  {
    id: 1,
    tipo: "Tubería Rota",
    servicio: "Agua",
    sector: "Unare",
    estado: "Pendiente",
    prioridad: "Alta",
    fecha: "12 May, 2024",
  },
  {
    id: 2,
    tipo: "Obstrucción",
    servicio: "Agua",
    sector: "Sierra Parima",
    estado: "En Revisión",
    prioridad: "Media",
    fecha: "15 May, 2024",
  },
  {
    id: 3,
    tipo: "Fuga",
    servicio: "Agua",
    sector: "Unare",
    estado: "Atendido",
    prioridad: "Alta",
    fecha: "20 May, 2024",
  },
  {
    id: 4,
    tipo: "Corte de Suministro",
    servicio: "Electricidad",
    sector: "Centro",
    estado: "Atendido",
    prioridad: "Alta",
    fecha: "22 May, 2024",
  },
  {
    id: 5,
    tipo: "Acumulación de Desechos",
    servicio: "Aseo Urbano",
    sector: "La Llanada",
    estado: "Pendiente",
    prioridad: "Baja",
    fecha: "25 May, 2024",
  },
];

const ESTADO_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  Pendiente: { bg: "#F1F5F9", color: "#64748B", label: "PENDIENTE" },
  "En Revisión": { bg: "#FEF3C7", color: "#D97706", label: "EN REVISIÓN" },
  Atendido: { bg: "#DCFCE7", color: "#16A34A", label: "ATENDIDO" },
};

const PRIORIDAD_CONFIG: Record<string, { color: string }> = {
  Alta: { color: "#EF4444" },
  Media: { color: "#F97316" },
  Baja: { color: "#22C55E" },
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
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
        <StatCard label="Total Reportes" value="5" sub="Reportes enviados" />
        <StatCard
          label="Atendidos"
          value="2"
          sub="Resueltos satisfactoriamente"
          valueColor="#16A34A"
        />
        <StatCard
          label="En Revisión"
          value="1"
          sub="En proceso de atención"
          valueColor="#D97706"
        />
        <StatCard
          label="Pendientes"
          value="2"
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
        <List
          data={REPORTES_DATA}
          filters={[
            { field: "estado", label: "Estado", type: "checkbox" },
            { field: "prioridad", label: "Prioridad", type: "checkbox" },
            { field: "tipo", label: "Tipo de Avería", type: "checkbox" },
            { field: "sector", label: "Buscar sector", type: "text" },
          ]}
          renderRowId={(id) => (
            <span className="font-mono text-xs text-gray-400">
              #URB-{String(id).padStart(4, "0")}
            </span>
          )}
          columns={[
            {
              key: "tipo",
              header: "Tipo de Avería",
              render: (row) => (
                <span className="font-semibold text-gray-900">{row.tipo}</span>
              ),
            },
            {
              key: "servicio",
              header: "Servicio",
              render: (row) => (
                <span className="text-gray-700">{row.servicio}</span>
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
                const s = PRIORIDAD_CONFIG[row.prioridad] ?? {
                  color: "#64748B",
                };
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
              onClick: (row) =>
                navigate(ROUTES.DETALLES_REPORTE, {
                  state: {
                    reporte: {
                      id: row.id,
                      correlativo: `#URB-${String(row.id).padStart(4, "0")}`,
                      empresa: "",
                      servicio: row.servicio,
                      prioridad: row.prioridad,
                      estado: row.estado,
                      sector: row.sector,
                      responsable: "",
                      creadoPor: "",
                    },
                    mode: "view",
                  },
                }),
            },
          ]}
          itemsPerPage={5}
        />
      </section>
    </div>
  );
}
