import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import {
  CirclePlus,
  Droplets,
  Zap,
  Trash2,
  ArrowUpRight,
  Search,
  LayoutGrid,
  AlignJustify,
  MapPin,
  Bus,
  Briefcase,
  Camera,
  Home,
  Bell,
} from "lucide-react";
import { Button, Input, Modal } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { type LucideIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceCardProps {
  name: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  nameColor: string;
  cardBg: string;
  arrowColor: string;
  onClick?: () => void;
  stats: {
    empresas: string;
    atendidos: string;
    sinAtender: string;
    totales: string;
  };
}

// ─── Service Card (inline, no usa el componente Card existente) ──────────────

function ServiceCard({
  name,
  subtitle,
  icon: Icon,
  iconColor,
  nameColor,
  cardBg,
  arrowColor,
  onClick,
  stats,
}: ServiceCardProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow"
      style={{ backgroundColor: cardBg }}
      onClick={onClick}
    >
      {/* Icono */}
      <div className="flex-shrink-0 flex items-center justify-center rounded-2xl w-14 h-14 bg-white">
        <Icon size={24} color={iconColor} />
      </div>

      {/* Nombre + subtítulo */}
      <div className="min-w-[180px]">
        <p className="font-bold text-lg leading-tight" style={{ color: nameColor }}>{name}</p>
        <p className="text-sm mt-0.5" style={{ color: nameColor, opacity: 0.7 }}>{subtitle}</p>
      </div>

      {/* Stats */}
      <div className="flex flex-1 gap-6 justify-center">
        {/* Empresas */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Empresas
          </span>
          <span className="text-xl font-bold text-gray-900">{stats.empresas}</span>
        </div>

        {/* Atendidos */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Atendidos
          </span>
          <span className="text-xl font-bold text-gray-900">{stats.atendidos}</span>
        </div>

        {/* Sin atender */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Sin atender
          </span>
          <span className="text-xl font-bold text-red-500">{stats.sinAtender}</span>
        </div>

        {/* Totales */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Totales
          </span>
          <span className="text-xl font-bold text-gray-900">{stats.totales}</span>
        </div>
      </div>

      {/* Flecha */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full w-9 h-9 cursor-pointer"
        style={{ backgroundColor: arrowColor }}
      >
        <ArrowUpRight size={18} color="#ffffff" />
      </div>
    </div>
  );
}

// ─── Datos de servicio ────────────────────────────────────────────────────────

const serviceCards: ServiceCardProps[] = [
  {
    name: "Agua",
    subtitle: "Suministro y Redes Hidráulicas",
    icon: Droplets,
    iconColor: "#2563EB",
    nameColor: "#2563EB",
    cardBg: "#EFF6FF",
    arrowColor: "#2563EB",
    stats: { empresas: "12", atendidos: "1,402", sinAtender: "24", totales: "1,426" },
  },
  {
    name: "Electricidad",
    subtitle: "Alumbrado Público y Energía",
    icon: Zap,
    iconColor: "#D97706",
    nameColor: "#D97706",
    cardBg: "#FFFBEB",
    arrowColor: "#D97706",
    stats: { empresas: "08", atendidos: "845", sinAtender: "05", totales: "850" },
  },
  {
    name: "Aseo Urbano",
    subtitle: "Recolección y Gestión de Residuos",
    icon: Trash2,
    iconColor: "#374151",
    nameColor: "#374151",
    cardBg: "#F9FAFB",
    arrowColor: "#6B7280",
    stats: { empresas: "15", atendidos: "2,110", sinAtender: "42", totales: "2,152" },
  },
];

// ─── Iconos del selector del modal ───────────────────────────────────────────

const selectorIcons: LucideIcon[] = [
  LayoutGrid,
  Zap,
  Trash2,
  AlignJustify,
  MapPin,
  Bus,
  Briefcase,
  Camera,
  Home,
  Bell,
];

const selectorColors = [
  "#FFFFFF",
  "#FEF9C3",
  "#E5E7EB",
  "#BAE6FD",
  "#FBCFE8",
];

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Servicios() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<LucideIcon | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (user?.role === "admin") {
    return (
      <>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 mb-6">
          {/* Label superior */}
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
            Administración Central
          </p>

          {/* Título + bloque eficiencia */}
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

            {/* Eficiencia global */}
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Eficiencia Global
              </span>
              <span className="text-3xl font-bold text-blue-600">94.2%</span>
            </div>
          </div>
        </div>

        {/* ── Barra de acciones ───────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 mb-6 flex items-center justify-between gap-4">
          {/* Buscador */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 w-64 bg-white">
            <Input
              typeInput="text"
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChange={setSearchQuery}
              classes="border-none outline-none text-sm bg-transparent p-0 focus:ring-0 flex-1"
            />
            <Search size={16} className="text-gray-400 flex-shrink-0" />
          </div>

          {/* Botón nuevo servicio */}
          <Button
            text="Servicio"
            icon={CirclePlus}
            variant_classes="btn-primary"
            onClick={() => setIsOpen(true)}
          />
        </div>

        {/* ── Service Cards ────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 flex flex-col gap-3">
          {serviceCards.map((card) => (
            <ServiceCard
              key={card.name}
              {...card}
              onClick={() => navigate(ROUTES.DETALLES_SERVICIO)}
            />
          ))}
        </section>

        {/* ── Modal Nueva Categoría ────────────────────────────────────────── */}
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Nueva Categoría de Servicio"
          description="Define una nueva agrupación lógica para los servicios ciudadanos."
          confirmText="Guardar Categoría"
          cancelText="Cancelar"
          onConfirm={() => setIsOpen(false)}
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

            {/* Selector de iconos */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Selector de Iconos
              </label>
              <div className="grid grid-cols-5 gap-2">
                {selectorIcons.map((IconItem, idx) => {
                  const isSelected = selectedIcon === IconItem;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIcon(IconItem)}
                      className={`flex items-center justify-center rounded-xl p-3 transition-colors ${
                        isSelected
                          ? "bg-blue-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <IconItem
                        size={20}
                        color={isSelected ? "#ffffff" : "#6B7280"}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de color */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Selector de Color
              </label>
              <div className="flex gap-3">
                {selectorColors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border transition-all ${
                        isSelected
                          ? "ring-2 ring-blue-600 ring-offset-2"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return null;
}