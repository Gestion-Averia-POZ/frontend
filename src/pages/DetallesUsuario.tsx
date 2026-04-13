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
} from "lucide-react";
import { Button } from "../components/ui";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";

// ── Types ─────────────────────────────────────────────────────────────────────

type TipoUsuario = "empresa" | "reportante" | "empleado";

interface NavState {
  tipo: TipoUsuario;
  origen: string;
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
  direccion: "Avenida Las Condes 12450, Depto 402, Santiago, Chile",
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
  direccion: "Urb. La Castellana, Calle 5, Casa 12, Caracas",
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

// ── Main component ────────────────────────────────────────────────────────────

export default function DetallesUsuario() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as NavState | null;
  const tipo: TipoUsuario = state?.tipo ?? "reportante";
  const origen: string = state?.origen ?? ROUTES.REPORTANTES;

  // ── EMPRESA VIEW ────────────────────────────────────────────────────────────
  if (tipo === "empresa") {
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
            Detalle de Empresa
          </h1>
          <Button text="Guardar Cambio" variant_classes="btn-primary" />
        </div>

        {/* Info card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex gap-8">
            {/* Left — avatar + meta */}
            <div className="flex flex-col items-center gap-3 min-w-[160px]">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                <Building2 size={40} color="#94A3B8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-base">
                  {EMPRESA_MOCK.nombre}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Empresa Verificada
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0040DF] text-xs font-semibold">
                {EMPRESA_MOCK.id}
              </span>
              <div className="w-full flex flex-col gap-1 mt-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado</span>
                  <span className="font-semibold text-green-600">
                    {EMPRESA_MOCK.estado}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Miembro desde</span>
                  <span className="text-gray-700">
                    {EMPRESA_MOCK.miembroDesde}
                  </span>
                </div>
              </div>
            </div>

            {/* Right — fields */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} color="#0040DF" />
                <span className="font-semibold text-gray-800">
                  Información de la Empresa
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Nombre de la Empresa"
                  value={EMPRESA_MOCK.nombre}
                  colSpan
                />
                <Field
                  label="Correo Electrónico"
                  value={EMPRESA_MOCK.correo}
                  icon={<Mail size={14} />}
                />
                <Field
                  label="Número de Teléfono"
                  value={EMPRESA_MOCK.telefono}
                  icon={<Phone size={14} />}
                />
                <Field
                  label="Dirección Completa"
                  value={EMPRESA_MOCK.direccion}
                  icon={<MapPin size={14} />}
                  colSpan
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employees list */}
        <div className="mb-6">
          <div className="flex justify-between mb-4 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Empleados</h2>

            <Button
              text="Empleado"
              icon={CirclePlus}
              variant_classes="btn-primary"
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

        {/* Reports list */}
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
      </div>
    );
  }

  // ── EMPLEADO VIEW ───────────────────────────────────────────────────────────
  if (tipo === "empleado") {
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
          <h1 className="text-3xl font-bold text-gray-900">Detalle de Empleado</h1>
          <button className="px-4 py-2 rounded-xl bg-[#0040DF] text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            Guardar Cambio
          </button>
        </div>

        {/* Info card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex gap-8">
            {/* Left — avatar + meta */}
            <div className="flex flex-col items-center gap-3 min-w-[160px]">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <UserCircle2 size={56} color="#94A3B8" />
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-base">
                  {EMPLEADO_MOCK.nombreCompleto}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{EMPLEADO_MOCK.cargo}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0040DF] text-xs font-semibold">
                {EMPLEADO_MOCK.id}
              </span>
              <div className="w-full flex flex-col gap-1 mt-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado</span>
                  <span className="font-semibold text-green-600">
                    {EMPLEADO_MOCK.estado}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Miembro desde</span>
                  <span className="text-gray-700">{EMPLEADO_MOCK.miembroDesde}</span>
                </div>
              </div>
            </div>

            {/* Right — fields */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={16} color="#0040DF" />
                <span className="font-semibold text-gray-800">
                  Información del Empleado
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Nombre Completo"
                  value={EMPLEADO_MOCK.nombreCompleto}
                  colSpan
                />
                <Field
                  label="Correo Electrónico"
                  value={EMPLEADO_MOCK.correo}
                  icon={<Mail size={14} />}
                />
                <Field
                  label="Número de Teléfono"
                  value={EMPLEADO_MOCK.telefono}
                  icon={<Phone size={14} />}
                />
                <Field
                  label="Dirección"
                  value={EMPLEADO_MOCK.direccion}
                  icon={<MapPin size={14} />}
                  colSpan
                />
                <Field
                  label="Empresa Asociada"
                  value={EMPLEADO_MOCK.empresaAsociada}
                  icon={<Building2 size={14} />}
                />
                <Field label="Cargo" value={EMPLEADO_MOCK.cargo} />
              </div>
            </div>
          </div>
        </div>

        {/* Assigned reports */}
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
      </div>
    );
  }

  // ── REPORTANTE VIEW ─────────────────────────────────────────────────────────
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
        <h1 className="text-3xl font-bold text-gray-900">Detalle de Usuario</h1>
        <Button text="Guardar Cambio" variant_classes="btn-primary" />
      </div>

      {/* Info card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex gap-8">
          {/* Left — avatar + meta */}
          <div className="flex flex-col items-center gap-3 min-w-[160px]">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <UserCircle2 size={56} color="#94A3B8" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-base">
                {REPORTANTE_MOCK.nombreCompleto
                  .split(" ")
                  .slice(0, 2)
                  .join(" ")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Ciudadano Verificado
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0040DF] text-xs font-semibold">
              ID: {REPORTANTE_MOCK.id}
            </span>
            <div className="w-full flex flex-col gap-1 mt-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Estado</span>
                <span className="font-semibold text-green-600">
                  {REPORTANTE_MOCK.estado}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Miembro desde</span>
                <span className="text-gray-700">
                  {REPORTANTE_MOCK.miembroDesde}
                </span>
              </div>
            </div>
          </div>

          {/* Right — fields */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <UserCircle2 size={16} color="#0040DF" />
              <span className="font-semibold text-gray-800">
                Información Personal
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Nombre Completo"
                value={REPORTANTE_MOCK.nombreCompleto}
                colSpan
              />
              <Field
                label="Correo Electrónico"
                value={REPORTANTE_MOCK.correo}
                icon={<Mail size={14} />}
              />
              <Field
                label="Número de Teléfono"
                value={REPORTANTE_MOCK.telefono}
                icon={<Phone size={14} />}
              />
              <Field
                label="Dirección Completa"
                value={REPORTANTE_MOCK.direccion}
                icon={<MapPin size={14} />}
                colSpan
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports list */}
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
        {/* <p className="text-xs text-gray-400 mt-2">
          Mostrando {REPORTES_REPORTANTE_DATA.length} de 14 reportes registrados
        </p> */}
      </div>
    </div>
  );
}
