import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import List, { type FilterConfig } from "../components/ui/LIst";
import Modal from "../components/ui/Modal";
import { requestsService, type SolicitudRequest } from "../services/requests.service";

// ── Tipo local para el List
type SolicitudRow = {
  id: string;
  solicitante: string;
  tipo: string;
  estado: string;
  fecha: string;
};

// ── Mapa raw → label para estados
const ESTADO_LABEL: Record<string, string> = {
  EN_PROCESO: "En Proceso",
  COMPLETADO: "Completado",
  CANCELADO:  "Cancelado",
};

// ── Mapper backend → row
function toRow(r: SolicitudRequest): SolicitudRow {
  return {
    id: r.id,
    solicitante: r.applicantName,
    tipo: r.type,
    estado: ESTADO_LABEL[r.state.name] ?? r.state.name,
    fecha: new Date(r.createdAt).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };
}

// ── Badge de tipo
const TIPO_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  DUDA:     { label: "Duda",     bg: "#DBEAFE", color: "#1D4ED8" },
  BUG:      { label: "Bug",      bg: "#FEE2E2", color: "#DC2626" },
  REGISTRO: { label: "Registro", bg: "#EDE9FE", color: "#7C3AED" },
};

// ── Badge de estado — claves por label (coincide con lo que guarda toRow)
const ESTADO_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  "En Proceso": { label: "En Proceso", bg: "#FEF3C7", color: "#D97706" },
  "Completado": { label: "Completado", bg: "#DCFCE7", color: "#16A34A" },
  "Cancelado":  { label: "Cancelado",  bg: "#FEE2E2", color: "#DC2626" },
};

function Badge({ value, config }: { value: string; config: typeof TIPO_CONFIG }) {
  const cfg = config[value];
  if (!cfg) return <span className="text-gray-500 text-xs">{value}</span>;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ── Columnas
const COLUMNS: FilterConfig<SolicitudRow>[] = [
  { field: "tipo",        label: "Tipo",        type: "checkbox" },
  { field: "estado",      label: "Estado",      type: "checkbox" },
  { field: "solicitante", label: "Solicitante",  type: "text"     },
];

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<SolicitudRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SolicitudRequest | null>(null);
  const [completando, setCompletando] = useState(false);

  useEffect(() => {
    requestsService
      .getAll()
      .then(setSolicitudes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleCompletar() {
    if (!selected) return;
    try {
      setCompletando(true);
      const updated = await requestsService.updateState(selected.id, "COMPLETADO");
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setSelected(updated);
    } catch (err) {
      console.error("Error al marcar como completado:", err);
    } finally {
      setCompletando(false);
    }
  }

  const rows = solicitudes.map(toRow);

  const yaCompletado = selected?.state.name === "COMPLETADO";

  return (
    <div className="flex flex-col gap-6 py-8 px-4">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona las solicitudes de soporte enviadas por los usuarios.
        </p>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <List
          columns={[
            { key: "solicitante", header: "Solicitante" },
            {
              key: "tipo",
              header: "Tipo",
              render: (row) => <Badge value={row.tipo} config={TIPO_CONFIG} />,
            },
            {
              key: "estado",
              header: "Estado",
              render: (row) => <Badge value={row.estado} config={ESTADO_CONFIG} />,
            },
            { key: "fecha", header: "Fecha" },
          ]}
          data={rows}
          filters={COLUMNS}
          itemsPerPage={10}
          actions={[
            {
              label: "Ver Detalles",
              icon: Eye,
              onClick: (row) => {
                const original = solicitudes.find((s) => s.id === row.id) ?? null;
                setSelected(original);
              },
              className: "btn btn-primary rounded-xl btn-xs sm:btn-sm md:btn-md",
            },
          ]}
        />
      )}

      {/* Modal de detalle */}
      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={`Solicitud — ${selected ? TIPO_CONFIG[selected.type]?.label ?? selected.type : ""}`}
        onConfirm={yaCompletado ? undefined : handleCompletar}
        confirmText={completando ? "Procesando..." : "Marcar como Completado"}
        confirmVariant="btn-primary"
      >
        {selected && (
          <div className="flex flex-col gap-5 text-sm">
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Solicitante</p>
                <p className="text-gray-800 font-medium">{selected.applicantName}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tipo</p>
                <Badge value={selected.type} config={TIPO_CONFIG} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</p>
                <Badge value={ESTADO_LABEL[selected.state.name] ?? selected.state.name} config={ESTADO_CONFIG} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Fecha</p>
                <p className="text-gray-800">
                  {new Date(selected.createdAt).toLocaleString("es-VE")}
                </p>
              </div>
            </div>

            {selected.user && (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Correo</p>
                <p className="text-gray-800">{selected.user.email}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Descripción</p>
              <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-xs leading-relaxed font-sans">
                {selected.description}
              </pre>
            </div>

            {yaCompletado && (
              <p className="text-xs text-green-600 font-medium text-center">
                Esta solicitud ya fue marcada como completada.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
