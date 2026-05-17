import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CirclePlus, PencilLine } from "lucide-react";
import { Input, Modal } from "../components/ui";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";
import { catalogService, type FullFailureType } from "../services/catalog.service";
import { useAllFailureTypes, useCategories, queryKeys } from "../hooks/useQueryHooks";

// ── Category badge colours (assigned by index) ────────────────────────────────

const BADGE_PALETTE: { bg: string; color: string }[] = [
  { bg: "#DBEAFE", color: "#1E40AF" },
  { bg: "#FEF9C3", color: "#854D0E" },
  { bg: "#DCFCE7", color: "#166534" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#E0F2FE", color: "#0369A1" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#F3F4F6", color: "#374151" },
];

const PRIORITY_OPTIONS = ["BAJA", "MEDIA", "ALTA", "CRITICA"] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function TiposAverias() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data: tiposData = [], isLoading: loadingFt, isError: isErrorFt } = useAllFailureTypes();
  const { data: categories = [], isLoading: loadingCat } = useCategories();
  const isLoading = loadingFt || loadingCat;

  const [saveError, setSaveError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [nombreIncidencia, setNombreIncidencia] = useState("");
  const [descripcionModal, setDescripcionModal] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("MEDIA");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isArchived, setIsArchived] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setNombreIncidencia("");
    setDescripcionModal("");
    setSelectedPriority("MEDIA");
    setSelectedCategoryId(categories[0]?.id ?? "");
    setIsArchived(false);
    setEditingItemId(null);
  }

  function openEditModal(row: FullFailureType) {
    setNombreIncidencia(row.name);
    setDescripcionModal(row.description ?? "");
    setSelectedPriority(row.priority);
    setSelectedCategoryId(row.categoryId ?? row.category?.id ?? "");
    setIsArchived(false);
    setEditingItemId(row.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  async function handleConfirm() {
    if (!nombreIncidencia.trim() || !selectedCategoryId) return;
    setIsSaving(true);
    try {
      if (isEditMode && editingItemId !== null) {
        if (isArchived) {
          await catalogService.deleteFailureType(editingItemId);
        } else {
          await catalogService.updateFailureType(editingItemId, {
            name: nombreIncidencia.trim(),
            description: descripcionModal.trim() || undefined,
            priority: selectedPriority,
            categoryId: selectedCategoryId,
          });
        }
      } else {
        await catalogService.createFailureType({
          name: nombreIncidencia.trim(),
          description: descripcionModal.trim() || undefined,
          priority: selectedPriority,
          categoryId: selectedCategoryId,
        });
      }
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog.allFailureTypes() });
    } catch {
      setSaveError("No se pudo guardar el tipo de avería.");
    } finally {
      setIsSaving(false);
    }
  }

  // Build category-name → badge config map dynamically
  const categoryBadgeMap: Record<string, { bg: string; color: string }> = {};
  categories.forEach((cat, idx) => {
    categoryBadgeMap[cat.name] = BADGE_PALETTE[idx % BADGE_PALETTE.length];
  });

  // Rows for List: map FullFailureType to display shape
  const listRows = tiposData.map((ft) => ({
    id: ft.id,
    nombre: ft.name,
    descripcion: ft.description ?? "—",
    categoria: ft.category?.name ?? "—",
    priority: ft.priority,
    _raw: ft,
  }));

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

      {/* ── Loading / Error ── */}
      {isLoading && (
        <p className="text-sm text-gray-400 text-center py-8">Cargando tipos de avería...</p>
      )}
      {!isLoading && (isErrorFt || saveError) && (
        <p className="text-sm text-red-500 text-center py-8">
          {saveError ?? "No se pudieron cargar los tipos de avería."}
        </p>
      )}

      {/* ── List ── */}
      {!isLoading && !isErrorFt && (
        <List
          data={listRows}
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
                const cfg = categoryBadgeMap[row.categoria] ?? {
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
          actions={[
            {
              label: "",
              icon: PencilLine,
              onClick: (row) => {
                const ft = tiposData.find((t) => t.id === row.id);
                if (ft) openEditModal(ft);
              },
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
      )}

      {/* ── Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditMode ? "Editar Tipo de Incidencia" : "Nuevo Tipo de Incidencia"}
        confirmText={isSaving ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Registrar"}
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
                placeholder="Ej. Tubería Rota"
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

          {/* Categoría */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Categoría
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF] text-sm w-full outline-none"
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Prioridad
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF] text-sm w-full outline-none"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Archivar (solo edición) */}
          {isEditMode && (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Archivar
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  El tipo de incidencia dejará de estar disponible en el sistema
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
          )}
        </div>
      </Modal>
    </div>
  );
}
