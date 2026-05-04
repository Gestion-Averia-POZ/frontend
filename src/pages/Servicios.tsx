import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { CirclePlus, Search, PencilLine, ArrowUpRight } from "lucide-react";
import { Button, Input, Modal } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { catalogService, type FullCategory } from "../services/catalog.service";

// ─── Paleta de colores pastel ─────────────────────────────────────────────────

const PASTEL_PALETTE: { bg: string; text: string; accent: string }[] = [
  { bg: "#DBEAFE", text: "#1E40AF", accent: "#2563EB" },
  { bg: "#FEF9C3", text: "#854D0E", accent: "#D97706" },
  { bg: "#DCFCE7", text: "#166534", accent: "#16A34A" },
  { bg: "#FCE7F3", text: "#9D174D", accent: "#BE185D" },
  { bg: "#E0F2FE", text: "#0369A1", accent: "#0284C7" },
  { bg: "#FEF3C7", text: "#92400E", accent: "#CA8A04" },
  { bg: "#F5F3FF", text: "#5B21B6", accent: "#7C3AED" },
  { bg: "#FFF1F2", text: "#9F1239", accent: "#E11D48" },
  { bg: "#ECFDF5", text: "#065F46", accent: "#059669" },
  { bg: "#FDF4FF", text: "#6B21A8", accent: "#9333EA" },
];

function getPastelStyle(id: string) {
  const hash = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PASTEL_PALETTE[hash % PASTEL_PALETTE.length];
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
  category,
  onEdit,
  onReactivate,
  onClick,
}: {
  category: FullCategory;
  onEdit?: () => void;
  onReactivate?: () => void;
  onClick?: () => void;
}) {
  const style = getPastelStyle(category.id);
  const isArchived = !category.isActive;

  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-6 py-5 transition-shadow ${
        isArchived ? "opacity-60" : "cursor-pointer hover:shadow-md"
      }`}
      style={{ backgroundColor: style.bg }}
      onClick={isArchived ? undefined : onClick}
    >
      <div className="flex flex-col gap-0.5">
        <p className="font-bold text-lg leading-tight" style={{ color: style.text }}>
          {category.name}
        </p>
        {isArchived && (
          <span className="text-xs font-medium" style={{ color: style.text, opacity: 0.6 }}>
            Archivado
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isArchived ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReactivate?.();
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/70 hover:bg-white transition-colors border border-white/50"
            style={{ color: style.text }}
          >
            Reactivar
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="flex items-center justify-center rounded-full w-9 h-9 bg-white/60 hover:bg-white/90 transition-colors"
            >
              <PencilLine size={18} color="#6B7280" />
            </button>
            <div
              className="flex items-center justify-center rounded-full w-9 h-9 cursor-pointer"
              style={{ backgroundColor: style.accent }}
              onClick={onClick}
            >
              <ArrowUpRight size={18} color="#ffffff" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Servicios() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<FullCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function fetchCategories() {
    setIsLoading(true);
    catalogService
      .getCategories(showArchived)
      .then((res) => setCategories(res.data.categories as FullCategory[]))
      .catch(() => setError("No se pudieron cargar los servicios."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  function resetForm() {
    setCategoryName("");
    setIsArchived(false);
    setEditingCategoryId(null);
  }

  function openEditModal(cat: FullCategory) {
    setCategoryName(cat.name);
    setIsArchived(false);
    setEditingCategoryId(cat.id);
    setIsEditMode(true);
    setIsOpen(true);
  }

  async function handleConfirm() {
    if (!categoryName.trim()) return;
    setIsSaving(true);
    try {
      if (isEditMode && editingCategoryId) {
        if (isArchived) {
          await catalogService.deleteCategory(editingCategoryId);
        } else {
          await catalogService.updateCategory(editingCategoryId, { name: categoryName.trim() });
        }
      } else {
        await catalogService.createCategory(categoryName.trim());
      }
      setIsOpen(false);
      resetForm();
      fetchCategories();
    } catch {
      setError("No se pudo guardar la categoría.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReactivate(id: string) {
    try {
      await catalogService.updateCategory(id, { isActive: true });
      fetchCategories();
    } catch {
      setError("No se pudo reactivar la categoría.");
    }
  }

  if (user?.role !== "admin") return null;

  const filtered = categories.filter((cat) => {
    if (showArchived ? cat.isActive : !cat.isActive) return false;
    const q = searchQuery.toLowerCase().trim();
    return !q || cat.name.toLowerCase().includes(q);
  });

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
          Administración Central
        </p>
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-[60%]">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Catálogo de Infraestructura
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Monitoreo en tiempo real de la capacidad operativa y el estado de
              atención ciudadana por cada vertical de servicio público.
            </p>
          </div>
        </div>
      </div>

      {/* ── Barra de acciones ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Buscador */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 w-64 bg-white">
            <Input
              typeInput="text"
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChange={setSearchQuery}
              classes="border-none outline-none text-sm bg-transparent p-0 focus:ring-0 flex-1"
            />
            <Search size={16} className="text-gray-400 flex-shrink-0" />
          </div>

          {/* Filtro archivados */}
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setShowArchived(!showArchived);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
              showArchived
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Archivados
          </button>
        </div>

        {/* Botón nuevo servicio — oculto en vista archivados */}
        {!showArchived && (
          <Button
            text="Servicio"
            icon={CirclePlus}
            variant_classes="btn-primary"
            onClick={() => {
              resetForm();
              setIsEditMode(false);
              setIsOpen(true);
            }}
          />
        )}
      </div>

      {/* ── Service Cards ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 flex flex-col gap-3">
        {isLoading && (
          <p className="text-sm text-gray-400 text-center py-8">Cargando servicios...</p>
        )}
        {!isLoading && error && (
          <p className="text-sm text-red-500 text-center py-8">{error}</p>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            {showArchived ? "No hay servicios archivados." : "No hay categorías registradas."}
          </p>
        )}
        {!isLoading &&
          filtered.map((cat) => (
            <ServiceCard
              key={cat.id}
              category={cat}
              onClick={() =>
                navigate(ROUTES.DETALLES_SERVICIO, {
                  state: {
                    servicio: {
                      id: cat.id,
                      name: cat.name,
                      ...getPastelStyle(cat.id),
                    },
                  },
                })
              }
              onEdit={() => openEditModal(cat)}
              onReactivate={() => handleReactivate(cat.id)}
            />
          ))}
      </section>

      {/* ── Modal Nueva / Editar Categoría ───────────────────────────────── */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          resetForm();
        }}
        title={isEditMode ? "Editar Categoría de Servicio" : "Nueva Categoría de Servicio"}
        description={
          isEditMode
            ? "Modifica el nombre de la categoría seleccionada."
            : "Define una nueva agrupación lógica para los servicios ciudadanos."
        }
        confirmText={isSaving ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Guardar Categoría"}
        cancelText="Cancelar"
        onConfirm={handleConfirm}
      >
        <div className="flex flex-col gap-5">
          {/* Nombre de categoría */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Nombre de Categoría
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-white">
              <Input
                typeInput="text"
                placeholder="Ej. Infraestructura Urbana"
                value={categoryName}
                onChange={setCategoryName}
                classes="text-sm border-none outline-none bg-transparent p-0 focus:ring-0 w-full"
              />
            </div>
          </div>

          {/* Archivar (solo edición) */}
          {isEditMode && (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Archivar
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  La categoría dejará de estar disponible en el sistema
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
    </>
  );
}
