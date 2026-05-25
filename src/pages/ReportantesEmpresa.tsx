import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";
import { useAuth } from "../context/AuthContext";
import {
  catalogService,
  type CompanyCitizen,
} from "../services/catalog.service";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ReportantesEmpresa() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reportantes, setReportantes] = useState<CompanyCitizen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.companyId) {
      setError("No se pudo identificar la empresa del usuario.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    catalogService
      .getCompanyCitizens(user.companyId)
      .then((res) => setReportantes(res.data.citizens))
      .catch(() => setError("No se pudieron cargar los reportantes."))
      .finally(() => setIsLoading(false));
  }, [user?.companyId]);

  const listRows = reportantes.map((c) => ({
    id: c.id,
    nombre: `${c.name} ${c.lastname}`,
    email: c.email,
    telefono: c.phoneNumber ?? "—",
    miembroDesde: formatDate(c.createdAt),
    _raw: c,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportantes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ciudadanos que han generado reportes dirigidos a tu empresa.
          </p>
        </div>
      </div>

      {/* Stat card */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 inline-flex flex-col gap-1 min-w-[220px]">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Total Reportantes
          </span>
          <span className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : reportantes.length}
          </span>
          <span className="text-xs text-gray-400">
            Usuarios que han reportado a tu empresa
          </span>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-400 text-center py-8">
          Cargando reportantes...
        </p>
      )}
      {!isLoading && error && (
        <p className="text-sm text-red-500 text-center py-8">{error}</p>
      )}
      {!isLoading && !error && reportantes.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
          <p className="text-gray-500 font-medium">Sin reportantes</p>
          <p className="text-xs text-gray-400 mt-1">
            Aún ningún ciudadano ha generado reportes dirigidos a tu empresa.
          </p>
        </div>
      )}

      {/* Reportantes list */}
      {!isLoading && !error && reportantes.length > 0 && (
        <List
          data={listRows}
          filters={[
            { field: "nombre", label: "Buscar nombre", type: "text" },
            { field: "email", label: "Buscar email", type: "text" },
          ]}
          renderRowId={(id) => (
            <span className="font-mono text-xs text-gray-400">
              {String(id).slice(0, 6).toUpperCase()}
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
              key: "miembroDesde",
              header: "Miembro desde",
              render: (row) => (
                <span className="text-gray-500">{row.miembroDesde}</span>
              ),
            },
          ]}
          actions={[
            {
              label: "Ver Detalles",
              onClick: (row) => {
                const c = reportantes.find((r) => r.id === row.id);
                if (!c) return;
                navigate(ROUTES.DETALLES_USUARIO, {
                  state: {
                    tipo: "reportante",
                    origen: ROUTES.REPORTANTES_EMPRESA,
                    data: {
                      id: c.id,
                      nombre: c.name,
                      apellido: c.lastname,
                      email: c.email,
                      telefono: c.phoneNumber ?? "",
                      estado: "Activo",
                      createdAt: c.createdAt,
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
