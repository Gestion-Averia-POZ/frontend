import { useNavigate } from "react-router-dom";
import { Briefcase, CirclePlus } from "lucide-react";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";
import { Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";

type Empleado = {
  id: number;
  nombre: string;
  empresa: string;
  correo: string;
  cargo: string;
  reportes: number;
};

const EMPLEADOS_DATA: Empleado[] = [
  {
    id: 1,
    nombre: "Carlos Pérez",
    empresa: "Aguas del Norte",
    correo: "c.perez@aguasdelnorte.com",
    cargo: "Inspector de Servicios",
    reportes: 12,
  },
  {
    id: 2,
    nombre: "María González",
    empresa: "Aguas del Norte",
    correo: "m.gonzalez@aguasdelnorte.com",
    cargo: "Técnica de Campo",
    reportes: 8,
  },
  {
    id: 3,
    nombre: "Luis Rodríguez",
    empresa: "Energía Urbana",
    correo: "l.rodriguez@energiaurbana.com",
    cargo: "Electricista Jefe",
    reportes: 15,
  },
  {
    id: 4,
    nombre: "Ana Torres",
    empresa: "Metrogas Central",
    correo: "a.torres@metrogascentral.com",
    cargo: "Operadora de Red",
    reportes: 6,
  },
  {
    id: 5,
    nombre: "Pedro Ramírez",
    empresa: "Aguas del Norte",
    correo: "p.ramirez@aguasdelnorte.com",
    cargo: "Supervisor Hidráulico",
    reportes: 10,
  },
  {
    id: 6,
    nombre: "Sofía Hernández",
    empresa: "Limpieza Regional",
    correo: "s.hernandez@limpiezareg.com",
    cargo: "Coordinadora de Rutas",
    reportes: 3,
  },
  {
    id: 7,
    nombre: "Jorge Martínez",
    empresa: "Energía Urbana",
    correo: "j.martinez@energiaurbana.com",
    cargo: "Técnico Eléctrico",
    reportes: 18,
  },
  {
    id: 8,
    nombre: "Valentina López",
    empresa: "Metrogas Central",
    correo: "v.lopez@metrogascentral.com",
    cargo: "Ingeniera de Procesos",
    reportes: 9,
  },
  {
    id: 9,
    nombre: "Roberto Díaz",
    empresa: "Aguas del Norte",
    correo: "r.diaz@aguasdelnorte.com",
    cargo: "Operador de Planta",
    reportes: 11,
  },
  {
    id: 10,
    nombre: "Gabriela Sánchez",
    empresa: "Limpieza Regional",
    correo: "g.sanchez@limpiezareg.com",
    cargo: "Auxiliar de Recolección",
    reportes: 7,
  },
];

export default function Empleados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Empleados Registrados
          </h1>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500 mt-1">
              Lista de empleados registrados en el sistema.
            </p>
            <Button
              text="Empleado"
              icon={CirclePlus}
              variant_classes="btn-primary"
              onClick={() =>
                navigate(ROUTES.DETALLES_USUARIO, {
                  state: {
                    tipo: "empleado",
                    origen: ROUTES.EMPLEADOS,
                    mode: "create",
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Stat card */}
      <div className="flex justify-between items-end mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Total Empleados
            </p>
            <p className="text-2xl font-bold text-gray-900">10</p>
          </div>
        </div>
      </div>

      {/* List */}
      <List
        data={EMPLEADOS_DATA}
        filters={[
          { field: "nombre", label: "Buscar nombre", type: "text" },
          ...(isAdmin
            ? [
                {
                  field: "empresa" as keyof Empleado,
                  label: "Buscar empresa",
                  type: "text" as const,
                },
              ]
            : []),
        ]}
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
              <span className="font-semibold text-gray-900">{row.nombre}</span>
            ),
          },
          ...(isAdmin
            ? [
                {
                  key: "empresa" as keyof Empleado,
                  header: "Empresa",
                  render: (row: Empleado) => (
                    <span className="text-gray-600">{row.empresa}</span>
                  ),
                },
              ]
            : []),
          {
            key: "reportes",
            header: "Reportes Asignados",
            render: (row) => (
              <span className="font-medium text-[#0040DF]">{row.reportes}</span>
            ),
          },
        ]}
        actions={[
          {
            label: "Ver Detalles",
            onClick: (row) =>
              navigate(ROUTES.DETALLES_USUARIO, {
                state: {
                  tipo: "empleado",
                  origen: ROUTES.EMPLEADOS,
                  data: row,
                },
              }),
          },
        ]}
        itemsPerPage={10}
      />
    </div>
  );
}
