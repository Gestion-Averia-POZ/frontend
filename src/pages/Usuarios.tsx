import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input, Modal, ImportCSVModal } from "../components/ui";
import List from "../components/ui/LIst";
import { ROUTES } from "../constants";
import { CirclePlus, Upload } from "lucide-react";
import { catalogService, type FullCompany } from "../services/catalog.service";
import { authService, type BackendUserProfile } from "../services/auth.service";

const statCardClass =
  "bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1";

// ── Main component ────────────────────────────────────────────────────────────

export default function Usuarios() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isEmpresas = pathname === ROUTES.EMPRESAS;

  if (isEmpresas) {
    return <EmpresasView navigate={navigate} />;
  }
  return <ReportantesView navigate={navigate} />;
}

// ── Empresas view ─────────────────────────────────────────────────────────────

function EmpresasView({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [companies, setCompanies] = useState<FullCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyRif, setCompanyRif] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function fetchCompanies() {
    setIsLoading(true);
    catalogService
      .getAllCompanies()
      .then((res) => setCompanies(res.data.companies))
      .catch(() => setError("No se pudieron cargar las empresas."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  function resetForm() {
    setCompanyName("");
    setCompanyRif("");
    setCompanyDesc("");
    setCompanyAddress("");
  }

  async function handleCreateCompany() {
    if (!companyName.trim()) return;
    setIsSaving(true);
    try {
      await catalogService.createCompany({
        name: companyName.trim(),
        rif: companyRif.trim() || undefined,
        description: companyDesc.trim() || undefined,
        address: companyAddress.trim() || undefined,
      });
      setIsModalOpen(false);
      resetForm();
      fetchCompanies();
    } catch {
      setError("No se pudo crear la empresa.");
    } finally {
      setIsSaving(false);
    }
  }

  const listRows = companies.map((c) => ({
    id: c.id,
    nombre: c.name,
    subtitulo: c.description ?? "—",
    rif: c.rif ?? "—",
    direccion: c.address ?? "—",
    estado: c.isActive ? "Activo" : "Inactivo",
    _raw: c,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compañías Registradas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona y monitorea las empresas prestadoras de servicios de infraestructura.
          </p>
        </div>
        <Button
          icon={CirclePlus}
          text="Empresa"
          variant_classes="btn-primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* Stat card */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className={statCardClass}>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Total Empresas
          </span>
          <span className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : companies.length}
          </span>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-400 text-center py-8">Cargando empresas...</p>
      )}
      {!isLoading && error && (
        <p className="text-sm text-red-500 text-center py-8">{error}</p>
      )}

      {/* Companies list */}
      {!isLoading && !error && (
        <List
          data={listRows}
          filters={[
            { field: "nombre", label: "Buscar empresa", type: "text" },
            { field: "rif", label: "Buscar RIF", type: "text" },
          ]}
          renderRowId={(id) => (
            <span className="font-mono text-xs text-gray-400">
              {String(id).slice(0, 6).toUpperCase()}
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
              key: "rif",
              header: "RIF",
              render: (row) => <span className="text-gray-700">{row.rif}</span>,
            },
            {
              key: "direccion",
              header: "Dirección",
              render: (row) => (
                <span className="text-gray-600 text-sm">{row.direccion}</span>
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
              onClick: (row) =>
                navigate(ROUTES.DETALLES_USUARIO, {
                  state: {
                    tipo: "empresa",
                    origen: ROUTES.EMPRESAS,
                    data: row,
                  },
                }),
            },
          ]}
          itemsPerPage={8}
        />
      )}

      {/* Create Empresa Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Nueva Empresa"
        description="Registra una nueva empresa prestadora de servicios."
        confirmText={isSaving ? "Guardando..." : "Registrar Empresa"}
        cancelText="Cancelar"
        onConfirm={handleCreateCompany}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Nombre *
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF]">
              <Input
                typeInput="text"
                placeholder="Nombre de la empresa"
                value={companyName}
                onChange={setCompanyName}
                classes="text-sm border-none outline-none bg-transparent p-0 w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              RIF
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF]">
              <Input
                typeInput="text"
                placeholder="J-12345678-9"
                value={companyRif}
                onChange={setCompanyRif}
                classes="text-sm border-none outline-none bg-transparent p-0 w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Descripción
            </label>
            <textarea
              rows={2}
              placeholder="Descripción de la empresa..."
              value={companyDesc}
              onChange={(e) => setCompanyDesc(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF] text-sm w-full outline-none resize-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Dirección
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 bg-[#F0F4FF]">
              <Input
                typeInput="text"
                placeholder="Dirección de la empresa"
                value={companyAddress}
                onChange={setCompanyAddress}
                classes="text-sm border-none outline-none bg-transparent p-0 w-full"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Reportantes view ──────────────────────────────────────────────────────────

function ReportantesView({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [reportantes, setReportantes] = useState<BackendUserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  function fetchReportantes() {
    setIsLoading(true);
    authService
      .getUsers({ role: "CITIZEN", limit: 200 })
      .then((res) => setReportantes(res.data.users))
      .catch(() => setError("No se pudieron cargar los reportantes."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchReportantes();
  }, []);

  async function handleToggleActive(user: BackendUserProfile) {
    try {
      if (user.isActive) {
        await authService.deactivateUser(user.id);
      } else {
        await authService.activateUser(user.id);
      }
      fetchReportantes();
    } catch {
      // Silently fail — UI stays as-is
    }
  }

  const listRows = reportantes.map((u) => ({
    id: u.id,
    nombre: `${u.name} ${u.lastname}`,
    email: u.email,
    telefono: u.phoneNumber ?? "—",
    estado: u.isActive ? "Activo" : "Inactivo",
    _raw: u,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportantes Registrados</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los usuarios que registran incidencias en la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            text="Importar"
            icon={Upload}
            variant_classes="btn-outline btn-sm"
            onClick={() => setIsImportOpen(true)}
          />
          <Button
            text="Reportante"
            icon={CirclePlus}
            variant_classes="btn-primary"
            onClick={() =>
              navigate(ROUTES.DETALLES_USUARIO, {
                state: { tipo: "reportante", origen: ROUTES.REPORTANTES, mode: "create" },
              })
            }
          />
        </div>
      </div>

      <ImportCSVModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type="users"
        onSuccess={() => {
          setIsImportOpen(false);
          fetchReportantes();
        }}
      />

      {/* Stat card */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 inline-flex flex-col gap-1 min-w-[220px]">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Total Reportantes
          </span>
          <span className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : reportantes.length}
          </span>
          <span className="text-xs text-gray-400">Usuarios en el sistema</span>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-400 text-center py-8">Cargando reportantes...</p>
      )}
      {!isLoading && error && (
        <p className="text-sm text-red-500 text-center py-8">{error}</p>
      )}

      {/* Reportantes list */}
      {!isLoading && !error && (
        <List
          data={listRows}
          filters={[
            { field: "nombre", label: "Buscar nombre", type: "text" },
            { field: "email", label: "Buscar email", type: "text" },
            { field: "estado", label: "Estado", type: "checkbox" },
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
              render: (row) => <span className="text-gray-600">{row.telefono}</span>,
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
              onClick: (row) => {
                const u = reportantes.find((r) => r.id === row.id);
                if (!u) return;
                navigate(ROUTES.DETALLES_USUARIO, {
                  state: {
                    tipo: "reportante",
                    origen: ROUTES.REPORTANTES,
                    data: {
                      id:        u.id,
                      nombre:    u.name,
                      apellido:  u.lastname,
                      email:     u.email,
                      telefono:  u.phoneNumber ?? "",
                      estado:    u.isActive ? "Activo" : "Inactivo",
                      createdAt: u.createdAt,
                      isActive:  u.isActive,
                    },
                  },
                });
              },
            },
            {
              label: (row: { estado: string }) =>
                row.estado === "Activo" ? "Desactivar" : "Activar",
              onClick: (row) => {
                const user = reportantes.find((u) => u.id === row.id);
                if (user) handleToggleActive(user);
              },
            },
          ]}
          itemsPerPage={10}
        />
      )}
    </div>
  );
}
