import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CirclePlus, Upload } from "lucide-react";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";
import { Button, ImportCSVModal, LoadingState } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { authService, type BackendUserProfile } from "../services/auth.service";

type EmpleadoRow = {
  id: string;
  nombre: string;
  empresa: string;
  correo: string;
  telefono: string;
};

function toRow(w: BackendUserProfile): EmpleadoRow {
  return {
    id:       w.id,
    nombre:   `${w.name} ${w.lastname}`,
    empresa:  w.company?.name ?? "—",
    correo:   w.email,
    telefono: w.phoneNumber ?? "—",
  };
}

export default function Empleados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [workers, setWorkers] = useState<BackendUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    const params = isAdmin
      ? { role: "WORKER", limit: 100 }
      : { role: "WORKER", companyName: user?.name, limit: 100 };

    authService
      .getUsers(params)
      .then((res) => setWorkers(res.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const rows = workers.map(toRow);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Empleados Registrados</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500">Lista de empleados registrados en el sistema.</p>
          <div className="flex items-center gap-2">
            <Button
              text="Importar"
              icon={Upload}
              variant_classes="btn-outline btn-sm"
              onClick={() => setIsImportOpen(true)}
            />
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
        </div>
      </div>

      {/* Stat card */}
      <div className="flex mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Total Empleados
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : workers.length}
            </p>
          </div>
        </div>
      </div>

      <ImportCSVModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type="users"
        onSuccess={() => {
          setIsImportOpen(false);
          const params = isAdmin
            ? { role: "WORKER", limit: 100 }
            : { role: "WORKER", companyName: user?.name, limit: 100 };
          setLoading(true);
          authService
            .getUsers(params)
            .then((res) => setWorkers(res.data.users))
            .catch(console.error)
            .finally(() => setLoading(false));
        }}
      />

      {/* List */}
      {loading ? (
        <LoadingState message="Cargando empleados…" />
      ) : (
        <List
          data={rows}
          filters={[
            { field: "nombre",   label: "Buscar nombre",  type: "text" },
            ...(isAdmin
              ? [{ field: "empresa" as keyof EmpleadoRow, label: "Buscar empresa", type: "text" as const }]
              : []),
          ]}
          columns={[
            {
              key: "nombre",
              header: "Nombre y Apellido",
              render: (row) => <span className="font-semibold text-gray-900">{row.nombre}</span>,
            },
            ...(isAdmin
              ? [{
                  key: "empresa" as keyof EmpleadoRow,
                  header: "Empresa",
                  render: (row: EmpleadoRow) => <span className="text-gray-600">{row.empresa}</span>,
                }]
              : []),
            {
              key: "correo",
              header: "Correo Electrónico",
              render: (row) => <span className="text-gray-600">{row.correo}</span>,
            },
            {
              key: "telefono",
              header: "Teléfono",
              render: (row) => <span className="text-gray-600">{row.telefono}</span>,
            },
          ]}
          actions={[
            {
              label: "Ver Detalles",
              onClick: (row) => {
                const worker = workers.find((w) => w.id === row.id);
                if (!worker) return;
                navigate(ROUTES.DETALLES_USUARIO, {
                  state: {
                    tipo: "empleado",
                    origen: ROUTES.EMPLEADOS,
                    data: {
                      id:        worker.id,
                      nombre:    worker.name,
                      apellido:  worker.lastname,
                      correo:    worker.email,
                      telefono:  worker.phoneNumber ?? "",
                      empresa:   worker.company?.name ?? "",
                      isActive:  worker.isActive,
                      createdAt: worker.createdAt,
                    },
                  },
                });
              },
            },
          ]}
          itemsPerPage={10}
        />
      )}
    </div>
  );
}
