import { useState } from "react";
import {
  ClipboardCheck,
  AlertTriangle,
  Files,
  TrendingUp,
  CirclePlus,
} from "lucide-react";
import { Input, Modal } from "../../../components/ui";
import List from "../../../components/ui/LIst";
import { useAuth } from "../../../context/AuthContext";
import { Map } from "../../../components/layout";

// ── Mock data ─────────────────────────────────────────────────────────────────

const INCIDENT_TYPES = [
  { tipo: "Tubería Rota", count: 4 },
  { tipo: "Obstrucción", count: 16 },
  { tipo: "Instalación", count: 5 },
  { tipo: "Fuga", count: 2 },
  { tipo: "Corte de Suministro", count: 9 },
  { tipo: "Mantenimiento", count: 7 },
];

const REPORTES_DATA = [
  {
    id: 1,
    tipo: "Tubería Rota",
    servicio: "Agua",
    fecha: "12 May, 2024",
    sector: "Unare",
    estado: "Pendiente",
  },
  {
    id: 2,
    tipo: "Obstrucción",
    servicio: "Agua",
    fecha: "15 May, 2024",
    sector: "Sierra Parima",
    estado: "En Proceso",
  },
  {
    id: 3,
    tipo: "Fuga",
    servicio: "Agua",
    fecha: "20 May, 2024",
    sector: "Unare",
    estado: "Atendido",
  },
  {
    id: 4,
    tipo: "Instalación",
    servicio: "Agua",
    fecha: "22 May, 2024",
    sector: "Centro",
    estado: "Pendiente",
  },
  {
    id: 5,
    tipo: "Obstrucción",
    servicio: "Agua",
    fecha: "25 May, 2024",
    sector: "La Llanada",
    estado: "Atendido",
  },
];

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

export default function DashboardCompany() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreIncidencia, setNombreIncidencia] = useState("");
  const [descripcion, setDescripcion] = useState("");

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0040DF] mb-1">
            Panel de Empresa
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Resumen de actividad y reportes de tu empresa.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Reportes"
          value="4,502"
          sub="Histórico acumulado"
        />
        <StatCard
          label="Atendidos"
          value="4,480"
          sub="99.5% de eficiencia"
          valueColor="#0040DF"
        />
        <StatCard
          label="Sin Atender"
          value="22"
          sub="Requieren atención"
          valueColor="#EF4444"
        />
        <StatCard
          label="Eficiencia Global"
          value="94.2%"
          sub="↑ Por encima del promedio"
          valueColor="#16A34A"
        />
      </div>

      {/* Map + Incident Types */}
      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: "3fr 1fr" }}
      >
        {/* Left — Mapa de Incidencias */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Mapa de Incidencias
          </h3>
          <div className="h-[380px] rounded-xl overflow-hidden">
            <Map />
          </div>
        </div>

        {/* Right — Tipos de Incidencia */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Tipos de Incidencia
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer hover:opacity-70 transition-opacity text-[#0040DF]"
            >
              <CirclePlus size={20} />
            </button>
          </div>
          <div className="flex flex-col">
            {INCIDENT_TYPES.map((item) => (
              <div
                key={item.tipo}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-700">{item.tipo}</span>
                <span className="text-sm font-bold text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Reportes Recientes
          </h2>
        </div>
        <List
          data={REPORTES_DATA}
          filters={[
            { field: "estado", label: "Estado", type: "checkbox" },
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
                const cfg: Record<string, { bg: string; color: string }> = {
                  Pendiente: { bg: "#F1F5F9", color: "#64748B" },
                  "En Proceso": { bg: "#FEF3C7", color: "#D97706" },
                  Atendido: { bg: "#DCFCE7", color: "#16A34A" },
                };
                const s = cfg[row.estado] ?? {
                  bg: "#F1F5F9",
                  color: "#64748B",
                };
                return (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: s.bg, color: s.color }}
                  >
                    {row.estado}
                  </span>
                );
              },
            },
          ]}
          actions={[{ label: "Ver Detalles", onClick: () => {} }]}
          itemsPerPage={5}
        />
      </div>

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
