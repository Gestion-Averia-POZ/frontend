import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CirclePlus, PencilLine, Archive } from "lucide-react";
import { Input, Modal } from "../components/ui";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";
import { useAuth } from "../context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type TipoAveria = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  archived: boolean;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const INITIAL_TIPOS: TipoAveria[] = [
  {
    id: 1,
    nombre: "Tubería Rota",
    descripcion: "Ruptura en la tubería principal de suministro",
    categoria: "Agua",
    archived: false,
  },
  {
    id: 2,
    nombre: "Obstrucción",
    descripcion: "Bloqueo parcial o total en la red de distribución",
    categoria: "Agua",
    archived: false,
  },
  {
    id: 3,
    nombre: "Fuga",
    descripcion: "Pérdida de fluido en puntos de la red",
    categoria: "Agua",
    archived: false,
  },
  {
    id: 4,
    nombre: "Corte de Suministro",
    descripcion: "Interrupción del servicio eléctrico en el sector",
    categoria: "Electricidad",
    archived: false,
  },
  {
    id: 5,
    nombre: "Falla en Transformador",
    descripcion: "Daño o sobrecarga en transformador de distribución",
    categoria: "Electricidad",
    archived: false,
  },
  {
    id: 6,
    nombre: "Acumulación de Desechos",
    descripcion: "Exceso de residuos sólidos sin recolección",
    categoria: "Aseo Urbano",
    archived: false,
  },
];

const CATEGORIA_CONFIG: Record<string, { bg: string; color: string }> = {
  Agua: { bg: "#DBEAFE", color: "#1E40AF" },
  Electricidad: { bg: "#FEF9C3", color: "#854D0E" },
  "Aseo Urbano": { bg: "#DCFCE7", color: "#166534" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TiposAverias() {
  const navigate = useNavigate();

  const [tiposData, setTiposData] = useState<TipoAveria[]>(INITIAL_TIPOS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [nombreIncidencia, setNombreIncidencia] = useState("");
  const [descripcionModal, setDescripcionModal] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  function resetForm() {
    setNombreIncidencia("");
    setDescripcionModal("");
    setIsArchived(false);
    setEditingItemId(null);
  }

  function openEditModal(row: TipoAveria) {
    setNombreIncidencia(row.nombre);
    setDescripcionModal(row.descripcion);
    setIsArchived(row.archived);
    setEditingItemId(row.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  function handleConfirm() {
    if (isEditMode && editingItemId !== null) {
      setTiposData((prev) =>
        prev.map((t) =>
          t.id === editingItemId
            ? {
                ...t,
                nombre: nombreIncidencia,
                descripcion: descripcionModal,
                archived: isArchived,
              }
            : t,
        ),
      );
    }
    setIsModalOpen(false);
    resetForm();
  }

  const { user } = useAuth();
  const isCompany = user?.role === "company";
  const companyCategorias = user?.categorias ?? [];

  const visibleTipos = tiposData.filter((t) => {
    if (showArchived ? !t.archived : t.archived) return false;
    if (isCompany && !companyCategorias.includes(t.categoria)) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <small className="text-[#0040DF] font-bold tracking-widest text-xs uppercase">
            Administración Central
          </small>
          <h1 className="text-3xl font-bold text-gray-900">Tipos de Averías</h1>
          <p className="text-sm text-gray-500 mt-1">
            Catálogo de tipos de incidencia registrados en el sistema.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
          className="flex cursor-pointer items-center gap-2 p-3 rounded-xl btn-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <CirclePlus size={18} />
          Tipo de incidencia
        </button>
      </div>

      {/* ── List ── */}
      <List
        data={visibleTipos}
        filters={[
          { field: "nombre", label: "Nombre", type: "text" },
          { field: "categoria", label: "Categoría", type: "checkbox" },
        ]}
        renderRowId={(id) => (
          <span className="font-mono text-xs text-gray-400">
            #AVR-{String(id).padStart(4, "0")}
          </span>
        )}
        columns={[
          {
            key: "nombre",
            header: "Nombre",
            render: (row) => (
              <span className="font-semibold text-gray-900">{row.nombre}</span>
            ),
          },
          {
            key: "descripcion",
            header: "Descripción",
            render: (row) => (
              <span className="text-gray-700">{row.descripcion}</span>
            ),
          },
          {
            key: "categoria",
            header: "Categoría",
            render: (row) => {
              const cfg = CATEGORIA_CONFIG[row.categoria] ?? {
                bg: "#F1F5F9",
                color: "#64748B",
              };
              return (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  {row.categoria}
                </span>
              );
            },
          },
        ]}
        filterActions={
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              showArchived
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Archive size={14} />
            Archivados
          </button>
        }
        actions={[
          {
            label: "",
            icon: PencilLine,
            onClick: openEditModal,
            className:
              "flex items-center justify-center rounded-full w-9 h-9 bg-gray-100 hover:bg-gray-200 transition-colors",
          },
          {
            label: "Ver Reportes",
            onClick: (row) =>
              navigate(ROUTES.REPORTES, {
                state: {
                  initialFilterState: {
                    checkbox: { tipoAveria: [row.nombre] },
                    text: {},
                  },
                },
              }),
          },
        ]}
      />

      {/* ── Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={
          isEditMode ? "Editar Tipo de Incidencia" : "Nuevo Tipo de Incidencia"
        }
        confirmText={isEditMode ? "Guardar Cambios" : "Registrar"}
        cancelText="Cancelar"
        onConfirm={handleConfirm}
      >
        <div className="flex flex-col gap-5">
          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Nombre de la Incidencia
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF]">
              <Input
                typeInput="text"
                placeholder="Ej. Mantenimiento"
                value={nombreIncidencia}
                onChange={setNombreIncidencia}
                classes="text-sm border-none outline-none bg-transparent p-0 w-full"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Descripción
            </label>
            <textarea
              rows={3}
              placeholder="Descripción..."
              value={descripcionModal}
              onChange={(e) => setDescripcionModal(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF] text-sm w-full outline-none resize-none"
            />
          </div>

          {/* Archivar */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Archivar
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                El tipo de incidencia no será visible en la lista principal
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsArchived(!isArchived)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                isArchived ? "bg-gray-800" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isArchived ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
