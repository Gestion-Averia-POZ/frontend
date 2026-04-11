import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";

// ── Empresas mock data ────────────────────────────────────────────────────────

const EMPRESAS_DATA = [
  {
    id: 1,
    nombre: "Aguas del Norte",
    subtitulo: "Infraestructura Hidráulica",
    empleados: 1240,
    totalReportes: 4502,
    atendidos: 4480,
    eficiencia: "99.5%",
    sinAtender: 22,
  },
  {
    id: 2,
    nombre: "Metrogas Central",
    subtitulo: "Distribución de Gas",
    empleados: 850,
    totalReportes: 2110,
    atendidos: 2005,
    eficiencia: "95.0%",
    sinAtender: 105,
  },
  {
    id: 3,
    nombre: "Energía Urbana",
    subtitulo: "Gestión de Red",
    empleados: 2410,
    totalReportes: 8920,
    atendidos: 8100,
    eficiencia: "90.8%",
    sinAtender: 820,
  },
  {
    id: 4,
    nombre: "Limpieza Regional",
    subtitulo: "Gestión de Residuos",
    empleados: 620,
    totalReportes: 1450,
    atendidos: 1448,
    eficiencia: "99.8%",
    sinAtender: 2,
  },
];

// ── Reportantes mock data ─────────────────────────────────────────────────────

const REPORTANTES_DATA = [
  {
    id: 1,
    nombre: "Carlos Pérez",
    email: "carlos@mail.com",
    telefono: "+58 412 123 4567",
    totalReportes: 14,
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "María González",
    email: "maria@mail.com",
    telefono: "+58 424 765 4321",
    totalReportes: 8,
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Luis Rodríguez",
    email: "luis@mail.com",
    telefono: "+58 416 234 5678",
    totalReportes: 3,
    estado: "Inactivo",
  },
  {
    id: 4,
    nombre: "Ana Martínez",
    email: "ana@mail.com",
    telefono: "+58 426 876 5432",
    totalReportes: 21,
    estado: "Activo",
  },
  {
    id: 5,
    nombre: "Pedro Sánchez",
    email: "pedro@mail.com",
    telefono: "+58 414 345 6789",
    totalReportes: 6,
    estado: "Inactivo",
  },
];

// ── Shared styles ─────────────────────────────────────────────────────────────

const statCardClass =
  "bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1";

// ── Main component ────────────────────────────────────────────────────────────

export default function Usuarios() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isEmpresas = pathname === ROUTES.EMPRESAS;

  if (isEmpresas) {
    return (
      <div className="max-w-6xl mx-auto px-4 pb-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Compañías Registradas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona y monitorea las empresas prestadoras de servicios de
              infraestructura.
            </p>
          </div>
          <Button text="+ Nueva Empresa" variant_classes="btn-primary" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className={statCardClass}>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Total Empresas
            </span>
            <span className="text-3xl font-bold text-gray-900">24</span>
            <span className="text-xs font-medium text-[#0040DF]">
              +2 este mes
            </span>
          </div>
          <div className={statCardClass}>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Servicios Activos
            </span>
            <span className="text-3xl font-bold text-gray-900">142</span>
            <span className="text-xs text-gray-400">Promedio global 5.9</span>
          </div>
          <div className={statCardClass}>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Tasa de Eficiencia
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">94.2%</span>
              <span className="text-sm font-semibold text-green-500">↑</span>
            </div>
            <span className="text-xs text-gray-400">Índice global</span>
          </div>
          <div className={statCardClass}>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Alertas Pendientes
            </span>
            <span className="text-3xl font-bold text-red-500">12</span>
            <span className="text-xs font-medium text-red-400">
              Acción requerida
            </span>
          </div>
        </div>

        {/* Companies list */}
        <List
          data={EMPRESAS_DATA}
          filters={[
            { field: "id", label: "Buscar ID", type: "text" },
            { field: "nombre", label: "Buscar empresa", type: "text" },
          ]}
          renderRowId={(id) => (
            <span className="font-mono text-xs text-gray-400">
              #{String(id).padStart(3, "0")}
            </span>
          )}
          columns={[
            {
              key: "nombre",
              header: "Empresa",
              render: (row) => (
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">{row.nombre}</span>
                  <span className="text-xs text-gray-400">{row.subtitulo}</span>
                </div>
              ),
            },
            {
              key: "empleados",
              header: "Empleados",
              render: (row) => (
                <span className="text-gray-700">
                  {row.empleados.toLocaleString()}
                </span>
              ),
            },
            {
              key: "totalReportes",
              header: "Total Reportes",
              render: (row) => (
                <span className="text-gray-700">
                  {row.totalReportes.toLocaleString()}
                </span>
              ),
            },
            {
              key: "atendidos",
              header: "Atendidos",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0040DF]">
                    {row.atendidos.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0040DF]">
                    {row.eficiencia}
                  </span>
                </div>
              ),
            },
            {
              key: "sinAtender",
              header: "Sin Atender",
              render: (row) => (
                <span className="font-semibold text-red-500">
                  {row.sinAtender}
                </span>
              ),
            },
          ]}
          actions={[
            {
              label: "Ver Detalles",
              onClick: () =>
                navigate(ROUTES.DETALLES_USUARIO, {
                  state: { tipo: "empresa", origen: ROUTES.EMPRESAS },
                }),
            },
          ]}
          itemsPerPage={4}
        />

        <p className="text-xs text-gray-400 mt-2">
          Mostrando 1-4 de 24 empresas
        </p>
      </div>
    );
  }

  // ── REPORTANTES VIEW ──────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reportantes Registrados
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los usuarios que registran incidencias en la plataforma.
          </p>
        </div>
        <Button text="+ Nuevo Reportante" variant_classes="btn-primary" />
      </div>

      {/* Stat card */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 inline-flex flex-col gap-1 min-w-[220px]">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Total Reportantes
          </span>
          <span className="text-3xl font-bold text-gray-900">248</span>
          <span className="text-xs text-gray-400">
            Usuarios activos en el sistema
          </span>
        </div>
      </div>

      {/* Reportantes list */}
      <List
        data={REPORTANTES_DATA}
        filters={[
          { field: "id", label: "Buscar ID", type: "text" },
          { field: "nombre", label: "Buscar nombre", type: "text" },
          { field: "email", label: "Buscar email", type: "text" },
          { field: "estado", label: "Estado", type: "checkbox" },
        ]}
        renderRowId={(id) => (
          <span className="font-mono text-xs text-gray-400">
            #{String(id).padStart(3, "0")}
          </span>
        )}
        columns={[
          {
            key: "nombre",
            header: "Nombre Completo",
            render: (row) => (
              <span className="font-bold text-gray-900">{row.nombre}</span>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (row) => <span className="text-gray-600">{row.email}</span>,
          },
          {
            key: "telefono",
            header: "Teléfono",
            render: (row) => (
              <span className="text-gray-600">{row.telefono}</span>
            ),
          },
          {
            key: "totalReportes",
            header: "Total Reportes",
            render: (row) => (
              <span className="text-gray-700">{row.totalReportes}</span>
            ),
          },
          {
            key: "estado",
            header: "Estado",
            render: (row) => {
              const isActive = row.estado === "Activo";
              return (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: isActive ? "#DCFCE7" : "#F1F5F9",
                    color: isActive ? "#16A34A" : "#64748B",
                  }}
                >
                  {row.estado}
                </span>
              );
            },
          },
        ]}
        actions={[
          {
            label: "Ver Detalles",
            onClick: () =>
              navigate(ROUTES.DETALLES_USUARIO, {
                state: { tipo: "reportante", origen: ROUTES.REPORTANTES },
              }),
          },
        ]}
        itemsPerPage={5}
      />
    </div>
  );
}
