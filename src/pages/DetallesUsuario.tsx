import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  UserCircle2,
  Building2,
  CirclePlus,
  Briefcase,
  Lock,
  Settings,
} from "lucide-react";
import { Button } from "../components/ui";
import List from "../components/ui/LIst";
import SearchableSelect from "../components/ui/SearchableSelect";
import { ROUTES } from "../constants";

const EMPRESAS_OPCIONES = [
  "Aguas del Norte",
  "Metrogas Central",
  "Energía Urbana",
  "Limpieza Regional",
];

// ── Types ─────────────────────────────────────────────────────────────────────

type TipoUsuario = "empresa" | "reportante" | "empleado";

interface NavState {
  tipo: TipoUsuario;
  origen: string;
  mode?: "create" | "view";
  data?: Record<string, unknown>;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const EMPRESA_MOCK = {
  id: "EMP-001",
  nombre: "Aguas del Norte",
  correo: "contacto@aguasdelnorte.com",
  telefono: "+58 212 555 0100",
  direccion: "Av. Principal, Torre Empresarial, Piso 5, Caracas",
  miembroDesde: "Ene 2021",
  estado: "Activo",
};

const EMPLEADOS_DATA = [
  {
    id: 1,
    nombre: "Carlos Pérez",
    telefono: "+58 412 123 4567",
    email: "carlos@aguasdelnorte.com",
  },
  {
    id: 2,
    nombre: "María González",
    telefono: "+58 424 765 4321",
    email: "maria@aguasdelnorte.com",
  },
  {
    id: 3,
    nombre: "Luis Rodríguez",
    telefono: "+58 416 234 5678",
    email: "luis@aguasdelnorte.com",
  },
];

const REPORTES_EMPRESA_DATA = [
  {
    id: 1,
    servicio: "Agua",
    tipo: "Tubería Rota",
    fecha: "12 May, 2024",
    estado: "Atendido",
  },
  {
    id: 2,
    servicio: "Agua",
    tipo: "Obstrucción",
    fecha: "15 May, 2024",
    estado: "En Revisión",
  },
  {
    id: 3,
    servicio: "Agua",
    tipo: "Fuga",
    fecha: "20 May, 2024",
    estado: "Pendiente",
  },
  {
    id: 4,
    servicio: "Agua",
    tipo: "Instalación",
    fecha: "22 May, 2024",
    estado: "Atendido",
  },
];

const REPORTANTE_MOCK = {
  id: "29.384.102-K",
  nombreCompleto: "Alejandro Javier Mendoza Ruiz",
  correo: "a.mendoza@email.com",
  telefono: "+56 9 8273 1920",
  miembroDesde: "Oct 2022",
  estado: "Activo",
};

const REPORTES_REPORTANTE_DATA = [
  {
    id: 8291,
    servicio: "Agua",
    tipo: "Fuga de agua en vía pública",
    fecha: "12 May, 2024",
    estado: "Atendido",
  },
  {
    id: 8304,
    servicio: "Luz",
    tipo: "Luminaria fundida en parque",
    fecha: "15 May, 2024",
    estado: "En Revisión",
  },
  {
    id: 8342,
    servicio: "Vialidad",
    tipo: "Bache profundo en calzada",
    fecha: "Hoy, 09:30",
    estado: "Pendiente",
  },
];

const EMPLEADO_MOCK = {
  id: "EMP-007",
  nombre: "Jorge",
  apellido: "Martínez",
  nombreCompleto: "Jorge Martínez",
  correo: "j.martinez@urbis.com",
  telefono: "+58 414 987 6543",
  empresaAsociada: "Aguas del Norte",
  cargo: "Inspector de Servicios",
  miembroDesde: "Mar 2022",
  estado: "Activo",
};

const REPORTES_EMPLEADO_DATA = [
  {
    id: 3021,
    servicio: "Agua",
    tipo: "Tubería Rota",
    fecha: "10 May, 2024",
    estado: "Atendido",
  },
  {
    id: 3045,
    servicio: "Electricidad",
    tipo: "Cable expuesto",
    fecha: "14 May, 2024",
    estado: "En Revisión",
  },
  {
    id: 3067,
    servicio: "Agua",
    tipo: "Fuga en medidor",
    fecha: "18 May, 2024",
    estado: "Pendiente",
  },
  {
    id: 3089,
    servicio: "Aseo Urbano",
    tipo: "Contenedor dañado",
    fecha: "21 May, 2024",
    estado: "Atendido",
  },
];

// ── Shared helpers ────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  icon,
  colSpan,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? "col-span-2" : ""}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF] text-sm text-gray-700">
        {icon && <span className="text-[#0040DF] shrink-0">{icon}</span>}
        {value}
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  icon,
  placeholder,
  type = "text",
  colSpan,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  type?: string;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? "col-span-2" : ""}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF] text-sm text-gray-700">
        {icon && <span className="text-[#0040DF] shrink-0">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent outline-none w-full placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const cfg: Record<string, { bg: string; color: string; dot: string }> = {
    Atendido: { bg: "#DCFCE7", color: "#16A34A", dot: "#16A34A" },
    "En Revisión": { bg: "#FEF3C7", color: "#D97706", dot: "#D97706" },
    Pendiente: { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" },
  };
  const s = cfg[estado] ?? { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: s.dot }}
      />
      {estado}
    </span>
  );
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIA_COLORS: Record<string, { bg: string; color: string }> = {
  Agua:          { bg: "#DBEAFE", color: "#1E40AF" },
  Electricidad:  { bg: "#FEF9C3", color: "#854D0E" },
  "Aseo Urbano": { bg: "#DCFCE7", color: "#166534" },
};
const TODAS_CATEGORIAS = Object.keys(CATEGORIA_COLORS);

// ── Main component ────────────────────────────────────────────────────────────

export default function DetallesUsuario() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as NavState | null;
  const tipo: TipoUsuario = state?.tipo ?? "reportante";
  const origen: string = state?.origen ?? ROUTES.REPORTANTES;
  const isCreateMode = state?.mode === "create";

  // Create-mode form states
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [empresaAsociada, setEmpresaAsociada] = useState("");
  const [cargo, setCargo] = useState("");
  const [password, setPassword] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [estadoRegistro, setEstadoRegistro] = useState<"archivado" | "cancelado" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [dropdownOpen]);

  // ── EMPRESA VIEW ────────────────────────────────────────────────────────────
  if (tipo === "empresa") {
    const row = state?.data;
    const empresa = {
      id: row?.id ? `EMP-${String(row.id).padStart(3, "0")}` : EMPRESA_MOCK.id,
      nombre: (row?.nombre as string) ?? EMPRESA_MOCK.nombre,
      correo: (row?.correo as string) ?? EMPRESA_MOCK.correo,
      telefono: (row?.telefono as string) ?? EMPRESA_MOCK.telefono,
      direccion: (row?.direccion as string) ?? EMPRESA_MOCK.direccion,
      categorias: (row?.categorias as string[]) ?? [],
      estado: EMPRESA_MOCK.estado,
      miembroDesde: EMPRESA_MOCK.miembroDesde,
    };

    return (
      <div className="max-w-6xl mx-auto px-4 pb-10">
        {/* Back link */}
        <button
          onClick={() => navigate(origen)}
          className="flex items-center gap-1.5 text-sm text-[#0040DF] font-medium hover:opacity-70 transition-opacity mb-3 cursor-pointer"
        >
          <ArrowLeft size={15} />
          Regresar a la lista
        </button>

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isCreateMode ? "Nueva Empresa" : "Detalle de Empresa"}
          </h1>
          <Button
            text={isCreateMode ? "Registrar" : "Guardar Cambio"}
            variant_classes="btn-primary"
          />
        </div>

        {/* Info card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 relative overflow-hidden">
          {estadoRegistro && (
            <div
              className="absolute top-6 -right-9 w-40 text-center text-[11px] font-bold tracking-widest text-white py-1.5 z-10 pointer-events-none"
              style={{
                transform: "rotate(45deg)",
                backgroundColor: estadoRegistro === "archivado" ? "#64748B" : "#DC2626",
              }}
            >
              {estadoRegistro === "archivado" ? "ARCHIVADO" : "CANCELADO"}
            </div>
          )}
          <div className="flex gap-8">
            {/* Left — avatar + meta */}
            <div className="flex flex-col items-center gap-3 min-w-[160px]">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                <Building2 size={40} color="#94A3B8" />
              </div>
              {!isCreateMode && (
                <>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-base">
                      {empresa.nombre}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Empresa Verificada
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0040DF] text-xs font-semibold">
                    {empresa.id}
                  </span>
                  <div className="w-full flex flex-col gap-1 mt-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado</span>
                      <span className="font-semibold text-green-600">
                        {empresa.estado}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creado en</span>
                      <span className="text-gray-700">
                        {empresa.miembroDesde}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right — fields */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} color="#0040DF" />
                <span className="font-semibold text-gray-800">
                  Información de la Empresa
                </span>
                {!isCreateMode && (
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => setDropdownOpen((v) => !v)}
                    >
                      <Settings size={16} color="#64748B" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                        <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={() => { setEstadoRegistro("archivado"); setDropdownOpen(false); }}>Archivar</button>
<button type="button" className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-t border-gray-100" onClick={() => { setEstadoRegistro(null); setDropdownOpen(false); }}>Restablecer</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {isCreateMode ? (
                  <>
                    <EditableField
                      label="Nombre de la Empresa"
                      value={nombre}
                      onChange={setNombre}
                      placeholder="Ej. Aguas del Norte"
                      colSpan
                    />
                    <EditableField
                      label="Correo Electrónico"
                      value={correo}
                      onChange={setCorreo}
                      placeholder="contacto@empresa.com"
                      icon={<Mail size={14} />}
                    />
                    <EditableField
                      label="Número de Teléfono"
                      value={telefono}
                      onChange={setTelefono}
                      placeholder="+58 212 555 0000"
                      icon={<Phone size={14} />}
                    />
                    <EditableField
                      label="Dirección Completa"
                      value={direccion}
                      onChange={setDireccion}
                      placeholder="Av. Principal, Torre, Piso..."
                      icon={<MapPin size={14} />}
                      colSpan
                    />
                    <div className="col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                        Categorías de Servicio
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TODAS_CATEGORIAS.map((cat) => {
                          const cfg = CATEGORIA_COLORS[cat];
                          const isSelected = categoriasSeleccionadas.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() =>
                                setCategoriasSeleccionadas((prev) =>
                                  prev.includes(cat)
                                    ? prev.filter((c) => c !== cat)
                                    : [...prev, cat],
                                )
                              }
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all cursor-pointer"
                              style={{
                                backgroundColor: isSelected ? cfg.bg : "transparent",
                                color: isSelected ? cfg.color : "#9CA3AF",
                                borderColor: isSelected ? cfg.color : "#E5E7EB",
                              }}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <EditableField
                      label="Contraseña"
                      value={password}
                      onChange={setPassword}
                      placeholder="••••••••"
                      type="password"
                      icon={<Lock size={14} />}
                      colSpan
                    />
                  </>
                ) : (
                  <>
                    <Field
                      label="Nombre de la Empresa"
                      value={empresa.nombre}
                      colSpan
                    />
                    <Field
                      label="Correo Electrónico"
                      value={empresa.correo}
                      icon={<Mail size={14} />}
                    />
                    <Field
                      label="Número de Teléfono"
                      value={empresa.telefono}
                      icon={<Phone size={14} />}
                    />
                    <Field
                      label="Dirección Completa"
                      value={empresa.direccion}
                      icon={<MapPin size={14} />}
                      colSpan
                    />
                    {empresa.categorias.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                          Categorías de Servicio
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {empresa.categorias.map((cat) => {
                            const cfg = CATEGORIA_COLORS[cat] ?? { bg: "#F1F5F9", color: "#64748B" };
                            return (
                              <span
                                key={cat}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: cfg.bg, color: cfg.color }}
                              >
                                {cat}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Employees list — view mode only */}
        {!isCreateMode && (
          <div className="mb-6">
            <div className="flex justify-between mb-4 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Empleados</h2>
              <Button
                text="Empleado"
                icon={CirclePlus}
                variant_classes="btn-primary"
                onClick={() =>
                  navigate(ROUTES.DETALLES_USUARIO, {
                    state: { tipo: "empleado", origen: ROUTES.EMPLEADOS, mode: "create" },
                  })
                }
              />
            </div>
            <List
              data={EMPLEADOS_DATA}
              renderRowId={(id) => (
                <span className="font-mono text-xs text-gray-400">
                  #{String(id).padStart(3, "0")}
                </span>
              )}
              columns={[
                {
                  key: "nombre",
                  header: "Nombre y Apellido",
                  render: (row) => (
                    <span className="font-semibold text-gray-900">
                      {row.nombre}
                    </span>
                  ),
                },
                {
                  key: "telefono",
                  header: "Teléfono",
                  render: (row) => (
                    <span className="text-gray-600">{row.telefono}</span>
                  ),
                },
                {
                  key: "email",
                  header: "Correo Electrónico",
                  render: (row) => (
                    <span className="text-gray-600">{row.email}</span>
                  ),
                },
              ]}
              actions={[
                {
                  label: "Ver Detalles",
                  onClick: () =>
                    navigate(ROUTES.DETALLES_USUARIO, {
                      state: { tipo: "reportante", origen: ROUTES.EMPRESAS },
                    }),
                },
              ]}
              itemsPerPage={5}
            />
          </div>
        )}

        {/* Reports list — view mode only */}
        {!isCreateMode && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Historial de Reportes
            </h2>
            <List
              data={REPORTES_EMPRESA_DATA}
              filters={[
                { field: "servicio", label: "Servicio", type: "checkbox" },
                { field: "tipo", label: "Tipo de Avería", type: "checkbox" },
                { field: "estado", label: "Estado", type: "checkbox" },
                { field: "fecha", label: "Buscar fecha", type: "text" },
              ]}
              renderRowId={(id) => (
                <span className="font-mono text-xs text-[#0040DF]">
                  #REP-{String(id).padStart(4, "0")}
                </span>
              )}
              columns={[
                {
                  key: "servicio",
                  header: "Servicio",
                  render: (row) => (
                    <span className="text-gray-700">{row.servicio}</span>
                  ),
                },
                {
                  key: "tipo",
                  header: "Tipo de Avería",
                  render: (row) => (
                    <span className="text-gray-700">{row.tipo}</span>
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
                  key: "estado",
                  header: "Estado",
                  render: (row) => <EstadoBadge estado={row.estado} />,
                },
              ]}
              actions={[
                {
                  label: "Ver Detalles",
                  onClick: () => navigate(ROUTES.DETALLES_REPORTE),
                },
              ]}
              itemsPerPage={5}
            />
          </div>
        )}
      </div>
    );
  }

  // ── EMPLEADO VIEW ───────────────────────────────────────────────────────────
  if (tipo === "empleado") {
    const rowE = state?.data;
    const empleado = {
      id: rowE?.id ? `EMP-${String(rowE.id).padStart(3, "0")}` : EMPLEADO_MOCK.id,
      nombreCompleto: (rowE?.nombre as string) ?? EMPLEADO_MOCK.nombreCompleto,
      correo: (rowE?.correo as string) ?? EMPLEADO_MOCK.correo,
      telefono: EMPLEADO_MOCK.telefono,
      empresaAsociada: (rowE?.empresa as string) ?? EMPLEADO_MOCK.empresaAsociada,
      cargo: (rowE?.cargo as string) ?? EMPLEADO_MOCK.cargo,
      estado: EMPLEADO_MOCK.estado,
      miembroDesde: EMPLEADO_MOCK.miembroDesde,
    };

    return (
      <div className="max-w-6xl mx-auto px-4 pb-10">
        {/* Back link */}
        <button
          onClick={() => navigate(origen)}
          className="flex items-center gap-1.5 text-sm text-[#0040DF] font-medium hover:opacity-70 transition-opacity mb-3 cursor-pointer"
        >
          <ArrowLeft size={15} />
          Regresar a la lista
        </button>

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isCreateMode ? "Nuevo Empleado" : "Detalle de Empleado"}
          </h1>
          <Button
            text={isCreateMode ? "Registrar" : "Guardar Cambio"}
            variant_classes="btn-primary"
          />
        </div>

        {/* Info card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 relative overflow-hidden">
          {estadoRegistro && (
            <div
              className="absolute top-6 -right-9 w-40 text-center text-[11px] font-bold tracking-widest text-white py-1.5 z-10 pointer-events-none"
              style={{
                transform: "rotate(45deg)",
                backgroundColor: estadoRegistro === "archivado" ? "#64748B" : "#DC2626",
              }}
            >
              {estadoRegistro === "archivado" ? "ARCHIVADO" : "CANCELADO"}
            </div>
          )}
          <div className="flex gap-8">
            {/* Left — avatar + meta */}
            <div className="flex flex-col items-center gap-3 min-w-[160px]">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <UserCircle2 size={56} color="#94A3B8" />
                </div>
                {!isCreateMode && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
              {!isCreateMode && (
                <>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-base">
                      {empleado.nombreCompleto}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {empleado.cargo}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0040DF] text-xs font-semibold">
                    {empleado.id}
                  </span>
                  <div className="w-full flex flex-col gap-1 mt-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado</span>
                      <span className="font-semibold text-green-600">
                        {empleado.estado}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creado en</span>
                      <span className="text-gray-700">
                        {empleado.miembroDesde}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right — fields */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={16} color="#0040DF" />
                <span className="font-semibold text-gray-800">
                  Información del Empleado
                </span>
                {!isCreateMode && (
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => setDropdownOpen((v) => !v)}
                    >
                      <Settings size={16} color="#64748B" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                        <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={() => { setEstadoRegistro("archivado"); setDropdownOpen(false); }}>Archivar</button>
<button type="button" className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-t border-gray-100" onClick={() => { setEstadoRegistro(null); setDropdownOpen(false); }}>Restablecer</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {isCreateMode ? (
                  <>
                    <EditableField
                      label="Nombre Completo"
                      value={nombre}
                      onChange={setNombre}
                      placeholder="Nombre y apellido"
                      colSpan
                    />
                    <EditableField
                      label="Correo Electrónico"
                      value={correo}
                      onChange={setCorreo}
                      placeholder="empleado@empresa.com"
                      icon={<Mail size={14} />}
                    />
                    <EditableField
                      label="Número de Teléfono"
                      value={telefono}
                      onChange={setTelefono}
                      placeholder="+58 414 000 0000"
                      icon={<Phone size={14} />}
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                        Empresa Asociada
                      </p>
                      <SearchableSelect
                        placeholder="Buscar empresa..."
                        options={EMPRESAS_OPCIONES}
                        value={empresaAsociada}
                        onChange={setEmpresaAsociada}
                      />
                    </div>
                    <EditableField
                      label="Cargo"
                      value={cargo}
                      onChange={setCargo}
                      placeholder="Ej. Inspector de Servicios"
                    />
                    <EditableField
                      label="Contraseña"
                      value={password}
                      onChange={setPassword}
                      placeholder="••••••••"
                      type="password"
                      icon={<Lock size={14} />}
                      colSpan
                    />
                  </>
                ) : (
                  <>
                    <Field
                      label="Nombre Completo"
                      value={empleado.nombreCompleto}
                      colSpan
                    />
                    <Field
                      label="Correo Electrónico"
                      value={empleado.correo}
                      icon={<Mail size={14} />}
                    />
                    <Field
                      label="Número de Teléfono"
                      value={empleado.telefono}
                      icon={<Phone size={14} />}
                    />
                    <Field
                      label="Empresa Asociada"
                      value={empleado.empresaAsociada}
                      icon={<Building2 size={14} />}
                    />
                    <Field label="Cargo" value={empleado.cargo} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned reports — view mode only */}
        {!isCreateMode && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Reportes Asignados
            </h2>
            <List
              data={REPORTES_EMPLEADO_DATA}
              filters={[
                { field: "servicio", label: "Servicio", type: "checkbox" },
                { field: "estado", label: "Estado", type: "checkbox" },
                { field: "tipo", label: "Buscar avería", type: "text" },
              ]}
              renderRowId={(id) => (
                <span className="font-mono text-xs text-[#0040DF]">
                  #REP-{String(id).padStart(4, "0")}
                </span>
              )}
              columns={[
                {
                  key: "servicio",
                  header: "Tipo de Servicio",
                  render: (row) => (
                    <span className="text-gray-700">{row.servicio}</span>
                  ),
                },
                {
                  key: "tipo",
                  header: "Tipo de Avería",
                  render: (row) => (
                    <span className="text-gray-700">{row.tipo}</span>
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
                  key: "estado",
                  header: "Estado",
                  render: (row) => <EstadoBadge estado={row.estado} />,
                },
              ]}
              actions={[
                {
                  label: "Ver Detalles",
                  onClick: () => navigate(ROUTES.DETALLES_REPORTE),
                },
              ]}
              itemsPerPage={5}
            />
          </div>
        )}
      </div>
    );
  }

  // ── REPORTANTE VIEW ─────────────────────────────────────────────────────────
  const rowR = state?.data;
  const reportante = {
    id: String(rowR?.id ?? REPORTANTE_MOCK.id),
    nombreCompleto: (rowR?.nombre as string) ?? REPORTANTE_MOCK.nombreCompleto,
    correo: (rowR?.email as string) ?? REPORTANTE_MOCK.correo,
    telefono: (rowR?.telefono as string) ?? REPORTANTE_MOCK.telefono,
    estado: (rowR?.estado as string) ?? REPORTANTE_MOCK.estado,
    miembroDesde: REPORTANTE_MOCK.miembroDesde,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Back link */}
      <button
        onClick={() => navigate(origen)}
        className="flex items-center gap-1.5 text-sm text-[#0040DF] font-medium hover:opacity-70 transition-opacity mb-3 cursor-pointer"
      >
        <ArrowLeft size={15} />
        Regresar a la lista
      </button>

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isCreateMode ? "Nuevo Reportante" : "Detalle de Usuario"}
        </h1>
        <Button
          text={isCreateMode ? "Registrar" : "Guardar Cambio"}
          variant_classes="btn-primary"
        />
      </div>

      {/* Info card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 relative overflow-hidden">
        {estadoRegistro && (
          <div
            className="absolute top-6 -right-9 w-40 text-center text-[11px] font-bold tracking-widest text-white py-1.5 z-10 pointer-events-none"
            style={{
              transform: "rotate(45deg)",
              backgroundColor: estadoRegistro === "archivado" ? "#64748B" : "#DC2626",
            }}
          >
            {estadoRegistro === "archivado" ? "ARCHIVADO" : "CANCELADO"}
          </div>
        )}
        <div className="flex gap-8">
          {/* Left — avatar + meta */}
          <div className="flex flex-col items-center gap-3 min-w-[160px]">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <UserCircle2 size={56} color="#94A3B8" />
              </div>
              {!isCreateMode && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>
            {!isCreateMode && (
              <>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base">
                    {reportante.nombreCompleto.split(" ").slice(0, 2).join(" ")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Ciudadano Verificado
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0040DF] text-xs font-semibold">
                  ID: {reportante.id}
                </span>
                <div className="w-full flex flex-col gap-1 mt-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado</span>
                    <span className="font-semibold text-green-600">
                      {reportante.estado}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Creado en</span>
                    <span className="text-gray-700">
                      {reportante.miembroDesde}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right — fields */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <UserCircle2 size={16} color="#0040DF" />
              <span className="font-semibold text-gray-800">
                Información Personal
              </span>
              {!isCreateMode && (
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => setDropdownOpen((v) => !v)}
                  >
                    <Settings size={16} color="#64748B" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={() => { setEstadoRegistro("archivado"); setDropdownOpen(false); }}>Archivar</button>
                      <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer" onClick={() => { setEstadoRegistro("cancelado"); setDropdownOpen(false); }}>Cancelar</button>
                      <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-t border-gray-100" onClick={() => { setEstadoRegistro(null); setDropdownOpen(false); }}>Restablecer</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {isCreateMode ? (
                <>
                  <EditableField
                    label="Nombre Completo"
                    value={nombre}
                    onChange={setNombre}
                    placeholder="Nombre y apellido"
                    colSpan
                  />
                  <EditableField
                    label="Correo Electrónico"
                    value={correo}
                    onChange={setCorreo}
                    placeholder="usuario@email.com"
                    icon={<Mail size={14} />}
                  />
                  <EditableField
                    label="Número de Teléfono"
                    value={telefono}
                    onChange={setTelefono}
                    placeholder="+58 412 000 0000"
                    icon={<Phone size={14} />}
                  />
                  <EditableField
                    label="Contraseña"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    type="password"
                    icon={<Lock size={14} />}
                    colSpan
                  />
                </>
              ) : (
                <>
                  <Field
                    label="Nombre Completo"
                    value={reportante.nombreCompleto}
                    colSpan
                  />
                  <Field
                    label="Correo Electrónico"
                    value={reportante.correo}
                    icon={<Mail size={14} />}
                  />
                  <Field
                    label="Número de Teléfono"
                    value={reportante.telefono}
                    icon={<Phone size={14} />}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reports list — view mode only */}
      {!isCreateMode && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Historial de Reportes
          </h2>
          <List
            data={REPORTES_REPORTANTE_DATA}
            filters={[
              { field: "servicio", label: "Servicio", type: "checkbox" },
              { field: "estado", label: "Estado", type: "checkbox" },
              { field: "tipo", label: "Buscar avería", type: "text" },
            ]}
            renderRowId={(id) => (
              <span className="font-mono text-xs text-[#0040DF]">
                #REP-{String(id).padStart(4, "0")}
              </span>
            )}
            columns={[
              {
                key: "servicio",
                header: "Tipo de Servicio",
                render: (row) => (
                  <span className="text-gray-700">{row.servicio}</span>
                ),
              },
              {
                key: "tipo",
                header: "Tipo de Avería",
                render: (row) => (
                  <span className="text-gray-700">{row.tipo}</span>
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
                key: "estado",
                header: "Estado",
                render: (row) => <EstadoBadge estado={row.estado} />,
              },
            ]}
            actions={[
              {
                label: "Ver Detalles",
                onClick: () => navigate(ROUTES.DETALLES_REPORTE),
              },
            ]}
            itemsPerPage={2}
          />
        </div>
      )}
    </div>
  );
}
