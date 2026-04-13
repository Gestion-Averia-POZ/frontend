import { useNavigate } from "react-router-dom";
import { Briefcase, CirclePlus } from "lucide-react";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";
import { Button } from "../components/ui";

type Empleado = {
  id: number;
  nombre: string;
  cargo: string;
  reportes: number;
};

const EMPLEADOS_DATA: Empleado[] = [
  { id: 1, nombre: "Carlos Pérez", cargo: "Técnico de Campo", reportes: 12 },
  {
    id: 2,
    nombre: "María González",
    cargo: "Supervisora de Zona",
    reportes: 8,
  },
  {
    id: 3,
    nombre: "Luis Rodríguez",
    cargo: "Inspector de Servicios",
    reportes: 15,
  },
  { id: 4, nombre: "Ana Torres", cargo: "Coordinadora Operativa", reportes: 6 },
  { id: 5, nombre: "Pedro Ramírez", cargo: "Técnico de Campo", reportes: 10 },
  {
    id: 6,
    nombre: "Sofía Hernández",
    cargo: "Asistente Administrativa",
    reportes: 3,
  },
  {
    id: 7,
    nombre: "Jorge Martínez",
    cargo: "Inspector de Servicios",
    reportes: 18,
  },
  { id: 8, nombre: "Valentina López", cargo: "Técnico de Campo", reportes: 9 },
  { id: 9, nombre: "Roberto Díaz", cargo: "Supervisor de Zona", reportes: 11 },
  {
    id: 10,
    nombre: "Gabriela Sánchez",
    cargo: "Coordinadora Operativa",
    reportes: 7,
  },
];

export default function Empleados() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0040DF] mb-1">
            Gestión de Personal
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500 mt-1">
              Lista de empleados registrados en el sistema.
            </p>
            <Button
              text="Empleado"
              icon={CirclePlus}
              variant_classes="btn-primary  "
            />
          </div>
        </div>
      </div>

      {/* Stat card */}
      <div className="flex justify-between items-end mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <Briefcase size={22} color="#0040DF" />
          </div>
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
          { field: "cargo", label: "Cargo", type: "checkbox" },
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
          {
            key: "cargo",
            header: "Cargo",
            render: (row) => <span className="text-gray-700">{row.cargo}</span>,
          },
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
            onClick: () =>
              navigate(ROUTES.DETALLES_USUARIO, {
                state: { tipo: "empleado", origen: ROUTES.EMPLEADOS },
              }),
          },
        ]}
        itemsPerPage={10}
      />
    </div>
  );
}
