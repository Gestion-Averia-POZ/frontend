import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CirclePlus } from "lucide-react";
import { Input, Modal } from "../components/ui";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";

const MOCK_TIPOS: {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
}[] = [
  {
    id: 1,
    nombre: "Tubería Rota",
    descripcion: "Ruptura en la tubería principal de suministro",
    categoria: "Agua",
  },
  {
    id: 2,
    nombre: "Obstrucción",
    descripcion: "Bloqueo parcial o total en la red de distribución",
    categoria: "Agua",
  },
  {
    id: 3,
    nombre: "Fuga",
    descripcion: "Pérdida de fluido en puntos de la red",
    categoria: "Agua",
  },
  {
    id: 4,
    nombre: "Corte de Suministro",
    descripcion: "Interrupción del servicio eléctrico en el sector",
    categoria: "Electricidad",
  },
  {
    id: 5,
    nombre: "Falla en Transformador",
    descripcion: "Daño o sobrecarga en transformador de distribución",
    categoria: "Electricidad",
  },
  {
    id: 6,
    nombre: "Acumulación de Desechos",
    descripcion: "Exceso de residuos sólidos sin recolección",
    categoria: "Aseo Urbano",
  },
];

const CATEGORIA_CONFIG: Record<string, { bg: string; color: string }> = {
  Agua: { bg: "#DBEAFE", color: "#1E40AF" },
  Electricidad: { bg: "#FEF9C3", color: "#854D0E" },
  "Aseo Urbano": { bg: "#DCFCE7", color: "#166534" },
};

export default function TiposAverias() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreIncidencia, setNombreIncidencia] = useState("");
  const [descripcion, setDescripcion] = useState("");

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
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
          onClick={() => setIsModalOpen(true)}
          className="flex cursor-pointer items-center gap-2 p-3 rounded-xl bg-[#0040DF] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <CirclePlus size={18} />
          Tipo de incidencia
        </button>
      </div>

      {/* List */}
      <List
        data={MOCK_TIPOS}
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
        actions={[
          {
            label: "Ver Reportes",
            onClick: () => navigate(ROUTES.REPORTES),
          },
        ]}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Tipo de Incidencia"
        confirmText="Registrar"
        cancelText="Cancelar"
        onConfirm={() => {
          setNombreIncidencia("");
          setDescripcion("");
          setIsModalOpen(false);
        }}
      >
        <div className="flex flex-col gap-5">
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Descripción
            </label>
            <textarea
              rows={3}
              placeholder="Descripción..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF] text-sm w-full outline-none resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
