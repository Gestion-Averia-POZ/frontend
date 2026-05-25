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
import { Button, LoadingState } from "../components/ui";
import List from "../components/ui/LIst";
import SearchableSelect from "../components/ui/SearchableSelect";
import { ROUTES } from "../constants";
import Modal from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService, type BackendUserProfile } from "../services/auth.service";
import {
  reportsService,
  type BackendReport,
} from "../services/reports.service";
import { catalogService } from "../services/catalog.service";

// ── Types ─────────────────────────────────────────────────────────────────────

type TipoUsuario = "empresa" | "reportante" | "empleado";

interface NavState {
  tipo: TipoUsuario;
  origen: string;
  mode?: "create" | "view";
  data?: Record<string, unknown>;
}

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
  const cfg: Record<
    string,
    { bg: string; color: string; dot: string; label: string }
  > = {
    Atendido: {
      bg: "#DCFCE7",
      color: "#16A34A",
      dot: "#16A34A",
      label: "Atendido",
    },
    "En Revisión": {
      bg: "#FEF3C7",
      color: "#D97706",
      dot: "#D97706",
      label: "En Revisión",
    },
    Pendiente: {
      bg: "#F1F5F9",
      color: "#64748B",
      dot: "#94A3B8",
      label: "Pendiente",
    },
    COMPLETADO: {
      bg: "#DCFCE7",
      color: "#16A34A",
      dot: "#16A34A",
      label: "Atendido",
    },
    EN_PROCESO: {
      bg: "#FEF3C7",
      color: "#D97706",
      dot: "#D97706",
      label: "En Revisión",
    },
    PENDIENTE: {
      bg: "#F1F5F9",
      color: "#64748B",
      dot: "#94A3B8",
      label: "Pendiente",
    },
    CANCELADO: {
      bg: "#FEE2E2",
      color: "#DC2626",
      dot: "#DC2626",
      label: "Cancelado",
    },
  };
  const s = cfg[estado] ?? {
    bg: "#F1F5F9",
    color: "#64748B",
    dot: "#94A3B8",
    label: estado,
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: s.dot }}
      />
      {s.label}
    </span>
  );
}

// ── Report helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type ReporteHistorialRow = {
  id: string | number;
  servicio: string;
  tipo: string;
  fecha: string;
  estado: string;
};

function toReporteRow(r: BackendReport): ReporteHistorialRow {
  return {
    id: r.id,
    servicio: r.category.name,
    tipo: r.failureType?.name ?? "—",
    fecha: formatDate(r.createdAt),
    estado: r.state.name,
  };
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIA_COLORS: Record<string, { bg: string; color: string }> = {
  Agua: { bg: "#DBEAFE", color: "#1E40AF" },
  Electricidad: { bg: "#FEF9C3", color: "#854D0E" },
  "Aseo Urbano": { bg: "#DCFCE7", color: "#166534" },
};
const TODAS_CATEGORIAS = Object.keys(CATEGORIA_COLORS);

// ── Main component ────────────────────────────────────────────────────────────

export default function DetallesUsuario() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const state = location.state as NavState | null;
  const tipo: TipoUsuario = state?.tipo ?? "reportante";
  const origen: string = state?.origen ?? ROUTES.REPORTANTES;
  const isCreateMode = state?.mode === "create";

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isMiCuenta = !state?.origen;
  const isCitizen = user?.role === "citizen";
  const isSelfView = isMiCuenta && isCitizen;
  const isCompanyMiCuenta = isMiCuenta && user?.role === "company";
  const isWorkerMiCuenta = isMiCuenta && user?.role === "worker";
  const isAdminMiCuenta = isMiCuenta && isAdmin;

  // Citizen self-view data
  const [fetchedUserData, setFetchedUserData] =
    useState<BackendUserProfile | null>(null);
  const [reportes, setReportes] = useState<BackendReport[]>([]);
  const [reportesLoading, setReportesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Empleado view data
  const [workerIsActive, setWorkerIsActive] = useState<boolean>(() =>
    tipo === "empleado" && !isCreateMode
      ? ((state?.data?.isActive as boolean) ?? true)
      : true,
  );
  const [assignedReports, setAssignedReports] = useState<BackendReport[]>([]);
  const [assignedReportsLoading, setAssignedReportsLoading] = useState(isWorkerMiCuenta);
  const [empresasOpciones, setEmpresasOpciones] = useState<string[]>([]);

  // Reportante view data (admin)
  const [reportanteReports, setReportanteReports] = useState<BackendReport[]>([]);
  const [reportanteReportsLoading, setReportanteReportsLoading] = useState(
    tipo === "reportante" && !isSelfView && !isCreateMode,
  );

  // Company self-view data
  const [companyWorkers, setCompanyWorkers] = useState<BackendUserProfile[]>(
    [],
  );
  const [companyOwnReports, setCompanyOwnReports] = useState<BackendReport[]>(
    [],
  );
  const [companyDataLoading, setCompanyDataLoading] = useState(false);

  // Create-mode form states
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    string[]
  >([]);
  const [nombre, setNombre] = useState(isSelfView ? (user?.name ?? "") : "");
  const [apellido, setApellido] = useState(
    isSelfView ? (user?.lastname ?? "") : "",
  );
  const [correo, setCorreo] = useState(isSelfView ? (user?.email ?? "") : "");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [empresaAsociada, setEmpresaAsociada] = useState("");

  const [password, setPassword] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [tempCategorias, setTempCategorias] = useState<string[]>([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [estadoRegistro, setEstadoRegistro] = useState<
    "archivado" | "cancelado" | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [dropdownOpen]);

  // Pre-populate form states when admin opens a view-mode record
  useEffect(() => {
    if (isCreateMode || !isAdmin || isAdminMiCuenta) return;
    const row = state?.data as Record<string, unknown> | undefined;
    if (tipo === "empresa") {
      setNombre(String(row?.nombre ?? ""));
      setDireccion(String(row?.direccion ?? ""));
    } else if (tipo === "empleado") {
      setNombre(String(row?.nombre ?? ""));
      setApellido(String(row?.apellido ?? ""));
      setCorreo(String(row?.correo ?? ""));
      setTelefono(String(row?.telefono ?? ""));
      setEmpresaAsociada(String(row?.empresa ?? ""));
    } else {
      setNombre(String(row?.nombre ?? ""));
      setApellido(String(row?.apellido ?? ""));
      setCorreo(String(row?.email ?? ""));
      setTelefono(String(row?.telefono ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch company's own workers + reports when visiting "Mi Cuenta" as company
  useEffect(() => {
    if (!isCompanyMiCuenta || !user?.name || !user?.id || !user?.companyId) return;
    setCompanyDataLoading(true);
    Promise.all([
      authService.getUsers({ role: "WORKER", companyName: user.name, limit: 100 }),
      reportsService.getAll({ limit: 1000 }),
      authService.getUserById(user.id),
      catalogService.getCompanyById(user.companyId),
    ])
      .then(([workersRes, reportsRes, profileRes, companyDetailRes]) => {
        setCompanyWorkers(workersRes.data.users);
        setCompanyOwnReports(
          reportsRes.data.reports.filter((r) => r.company?.name === user.name),
        );
        setTelefono(profileRes.data.user.phoneNumber ?? "");
        const cats = companyDetailRes.data.company.categories ?? [];
        setCategoriasSeleccionadas(cats.map((c) => c.name));
      })
      .catch(console.error)
      .finally(() => setCompanyDataLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch reports assigned to the worker being viewed
  useEffect(() => {
    if (tipo !== "empleado" || isCreateMode) return;
    const workerId = state?.data?.id as string | undefined;
    if (!workerId) return;
    setAssignedReportsLoading(true);
    reportsService
      .getAll({ assignedManagerId: workerId, limit: 1000 })
      .then((res) => setAssignedReports(res.data.reports))
      .catch(console.error)
      .finally(() => setAssignedReportsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch logged-in citizen's own data + reports when visiting "Mi Cuenta"
  useEffect(() => {
    if (!isSelfView || !user?.id) return;
    authService.getUserById(user.id).then((res) => {
      const u = res.data.user;
      setFetchedUserData(u);
      setTelefono(u.phoneNumber ?? "");
    });
    setReportesLoading(true);
    reportsService
      .getByUser(user.id)
      .then((res) => setReportes(res.data.reports))
      .finally(() => setReportesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch worker's phone + assigned reports when visiting "Mi Cuenta" as worker
  useEffect(() => {
    if (!isWorkerMiCuenta || !user?.id) return;
    Promise.all([
      authService.getUserById(user.id),
      reportsService.getAssigned(),
    ])
      .then(([profileRes, reportsRes]) => {
        setTelefono(profileRes.data.user.phoneNumber ?? "");
        setAssignedReports(reportsRes.data.reports);
      })
      .catch(console.error)
      .finally(() => setAssignedReportsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch admin's own profile when visiting "Mi Cuenta" as admin
  useEffect(() => {
    if (!isAdminMiCuenta || !user?.id) return;
    authService.getUserById(user.id).then((res) => {
      const u = res.data.user;
      setNombre(u.name);
      setApellido(u.lastname);
      setCorreo(u.email);
      setTelefono(u.phoneNumber ?? "");
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch empresa data (workers, reports, company user, categories) when admin views an empresa
  useEffect(() => {
    if (!isAdmin || isAdminMiCuenta || tipo !== "empresa" || isCreateMode) return;
    const row = state?.data as Record<string, unknown> | undefined;
    const companyName = String(row?.nombre ?? "");
    const companyId = String(row?.id ?? "");
    if (!companyName || !companyId) return;
    setCompanyDataLoading(true);
    Promise.all([
      authService.getUsers({ role: "COMPANY", companyName, limit: 5 }),
      authService.getUsers({ role: "WORKER", companyName, limit: 100 }),
      reportsService.getAll({ companyName, limit: 1000 }),
      catalogService.getCompanyById(companyId),
    ])
      .then(([companyUserRes, workersRes, reportsRes, companyDetailRes]) => {
        const companyUser = companyUserRes.data.users[0];
        if (companyUser) {
          setCorreo(companyUser.email);
          setTelefono(companyUser.phoneNumber ?? "");
        }
        setCompanyWorkers(workersRes.data.users);
        setCompanyOwnReports(reportsRes.data.reports);
        const cats = companyDetailRes.data.company.categories ?? [];
        setCategoriasSeleccionadas(cats.map((c) => c.name));
      })
      .catch(console.error)
      .finally(() => setCompanyDataLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch reportante's reports when admin/company views a reportante.
  // Una empresa SOLO puede ver los reportes que ese ciudadano dirigió a ella:
  // filtramos por companyName en el servidor y reforzamos con companyId exacto en cliente.
  useEffect(() => {
    if (tipo !== "reportante" || isSelfView || isCreateMode) return;
    const reportanteId = state?.data?.id as string | undefined;
    if (!reportanteId) return;
    const isCompanyViewer = user?.role === "company";
    reportsService
      .getByUser(
        reportanteId,
        isCompanyViewer && user?.name ? { companyName: user.name } : undefined,
      )
      .then((res) => {
        const reports =
          isCompanyViewer && user?.companyId
            ? res.data.reports.filter((r) => r.company?.id === user.companyId)
            : res.data.reports;
        setReportanteReports(reports);
      })
      .catch(console.error)
      .finally(() => setReportanteReportsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch real companies for the empleado empresa dropdown
  useEffect(() => {
    if (tipo !== "empleado" || !isAdmin) return;
    catalogService
      .getCompanies()
      .then((res) => setEmpresasOpciones(res.data.companies.map((c) => c.name)))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateEmployee() {
    if (!nombre.trim() || !apellido.trim() || !correo.trim()) return;
    const companyId = user?.companyId;
    if (!companyId) return;
    setSaving(true);
    try {
      await authService.createEmployee({
        name: nombre.trim(),
        lastname: apellido.trim(),
        email: correo.trim(),
        password: "123456",
        companyId,
        ...(telefono.trim() ? { phoneNumber: telefono.trim() } : {}),
      });
      toast.success("Empleado registrado correctamente.");
      navigate(ROUTES.EMPLEADOS);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo registrar el empleado.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateReportante() {
    if (!nombre.trim() || !apellido.trim() || !correo.trim() || !password.trim()) return;
    setSaving(true);
    try {
      await authService.register({
        name: nombre.trim(),
        lastname: apellido.trim(),
        email: correo.trim(),
        password: password.trim(),
        ...(telefono.trim() ? { phoneNumber: telefono.trim() } : {}),
      });
      toast.success("Reportante registrado correctamente.");
      navigate(ROUTES.REPORTANTES);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo registrar el reportante.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCitizen() {
    if (!user?.id) return;
    setSaving(true);
    try {
      await authService.updateUser(user.id, {
        name: nombre.trim(),
        lastname: apellido.trim(),
        ...(telefono ? { phoneNumber: telefono } : {}),
      });
      // Actualizar localStorage para que el contexto refleje los nuevos valores
      const stored = localStorage.getItem("urbis_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem(
          "urbis_user",
          JSON.stringify({
            ...parsed,
            name: nombre.trim(),
            lastname: apellido.trim(),
          }),
        );
      }
      toast.success("Cambios guardados correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  // ── WORKER SELF-VIEW (Mi Cuenta) ────────────────────────────────────────────
  if (isWorkerMiCuenta) {
    return (
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
        </div>

        {/* Info card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex gap-8">
            {/* Left — avatar + meta */}
            <div className="flex flex-col items-center gap-3 min-w-[160px]">
              <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <UserCircle2 size={56} color="#94A3B8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-base">
                  {user?.name} {user?.lastname}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Empleado</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0040DF] text-xs font-semibold">
                Activo
              </span>
            </div>

            {/* Right — fields */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={16} color="#0040DF" />
                <span className="font-semibold text-gray-800">
                  Información del Empleado
                </span>
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
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setPasswordModalOpen(true);
                          setDropdownOpen(false);
                        }}
                      >
                        Restablecer contraseña
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Nombre Completo"
                  value={`${user?.name ?? ""} ${user?.lastname ?? ""}`.trim()}
                  colSpan
                />
                <Field
                  label="Correo Electrónico"
                  value={user?.email ?? ""}
                  icon={<Mail size={14} />}
                />
                <Field
                  label="Número de Teléfono"
                  value={assignedReportsLoading ? "..." : telefono || "—"}
                  icon={<Phone size={14} />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assigned reports */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Reportes Asignados
          </h2>
          {assignedReportsLoading ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Cargando...
            </p>
          ) : assignedReports.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
              <p className="text-gray-500 font-medium">Sin reportes asignados</p>
              <p className="text-xs text-gray-400 mt-1">
                Los reportes asignados a tu cuenta aparecerán aquí.
              </p>
            </div>
          ) : (
            <List
              data={assignedReports.map(toReporteRow)}
              filters={[
                { field: "servicio", label: "Servicio",      type: "checkbox" },
                { field: "estado",   label: "Estado",        type: "checkbox" },
                { field: "tipo",     label: "Buscar avería", type: "text"     },
              ]}
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
                  onClick: (row) => {
                    const r = assignedReports.find((rep) => rep.id === row.id);
                    if (!r) return;
                    navigate(ROUTES.DETALLES_REPORTE, {
                      state: {
                        mode: "view",
                        reporte: {
                          id:          r.id,
                          correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
                          empresa:     r.company?.name ?? "—",
                          servicio:    r.category.name,
                          categoryId:  r.category.id,
                          tipoAveria:  r.failureType?.name ?? "—",
                          prioridad:   r.priority,
                          estado:      r.state.name,
                          sector:      r.neighborhood?.name ?? "—",
                          responsable: r.assignedManager
                            ? `${r.assignedManager.name} ${r.assignedManager.lastname}`
                            : "",
                          creadoPor:   `${r.user.name} ${r.user.lastname}`,
                          descripcion: r.description,
                          address:     r.address ?? "",
                          latitude:    r.latitude,
                          longitude:   r.longitude,
                          createdAt:   r.createdAt,
                        },
                      },
                    });
                  },
                },
              ]}
              itemsPerPage={5}
            />
          )}
        </div>

        <Modal
          isOpen={passwordModalOpen}
          onClose={() => {
            setPasswordModalOpen(false);
            setResetPassword("");
            setResetConfirmPassword("");
          }}
          title="Restablecer contraseña"
          confirmText="Guardar"
          onConfirm={() => {
            setPasswordModalOpen(false);
            setResetPassword("");
            setResetConfirmPassword("");
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Introduzca la contraseña
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
                <span className="text-[#0040DF] shrink-0">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Repita la contraseña
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
                <span className="text-[#0040DF] shrink-0">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ── COMPANY SELF-VIEW (Mi Cuenta) ───────────────────────────────────────────
  if (isCompanyMiCuenta) {
    const workerRows = companyWorkers.map((w) => ({
      id: w.id,
      nombre: `${w.name} ${w.lastname}`,
      telefono: w.phoneNumber ?? "—",
      email: w.email,
    }));
    const reportRows = companyOwnReports.map(toReporteRow);

    return (
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
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
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Empresa Verificada
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold">
                Activo
              </span>
            </div>

            {/* Right — fields */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} color="#0040DF" />
                <span className="font-semibold text-gray-800">
                  Información de la Empresa
                </span>
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
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setPasswordModalOpen(true);
                          setDropdownOpen(false);
                        }}
                      >
                        Restablecer contraseña
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Nombre de la Empresa"
                  value={user?.name ?? ""}
                  colSpan
                />
                <Field
                  label="Correo Electrónico"
                  value={user?.email ?? ""}
                  icon={<Mail size={14} />}
                />
                <Field
                  label="Número de Teléfono"
                  value={companyDataLoading ? "..." : telefono || "—"}
                  icon={<Phone size={14} />}
                />
                {!companyDataLoading && categoriasSeleccionadas.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                      Categorías de Servicio
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categoriasSeleccionadas.map((cat) => {
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
              </div>
            </div>
          </div>
        </div>

        {/* Employees */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Empleados</h2>
          {companyDataLoading ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Cargando...
            </p>
          ) : workerRows.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Sin empleados registrados.
            </p>
          ) : (
            <List
              data={workerRows}
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
              itemsPerPage={5}
            />
          )}
        </div>

        {/* Reports */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Historial de Reportes
          </h2>
          {companyDataLoading ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Cargando...
            </p>
          ) : reportRows.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Sin reportes registrados.
            </p>
          ) : (
            <List
              data={reportRows}
              filters={[
                { field: "servicio", label: "Servicio", type: "checkbox" },
                { field: "tipo", label: "Tipo de Avería", type: "checkbox" },
                { field: "estado", label: "Estado", type: "checkbox" },
              ]}
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
                  onClick: (row) => {
                    const r = companyOwnReports.find((rep) => rep.id === row.id);
                    if (!r) return;
                    navigate(ROUTES.DETALLES_REPORTE, {
                      state: {
                        mode: "view",
                        companyView: "propios",
                        reporte: {
                          id:          r.id,
                          correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
                          empresa:     r.company?.name ?? "—",
                          servicio:    r.category.name,
                          categoryId:  r.category.id,
                          tipoAveria:  r.failureType?.name ?? "—",
                          prioridad:   r.priority,
                          estado:      r.state.name,
                          sector:      r.neighborhood?.name ?? "—",
                          responsable: r.assignedManager
                            ? `${r.assignedManager.name} ${r.assignedManager.lastname}`
                            : "",
                          creadoPor:   `${r.user.name} ${r.user.lastname}`,
                          descripcion: r.description,
                          address:     r.address ?? "",
                          latitude:    r.latitude,
                          longitude:   r.longitude,
                          createdAt:   r.createdAt,
                        },
                      },
                    });
                  },
                },
              ]}
              itemsPerPage={5}
            />
          )}
        </div>

        <Modal
          isOpen={passwordModalOpen}
          onClose={() => {
            setPasswordModalOpen(false);
            setResetPassword("");
            setResetConfirmPassword("");
          }}
          title="Restablecer contraseña"
          confirmText="Guardar"
          onConfirm={() => {
            setPasswordModalOpen(false);
            setResetPassword("");
            setResetConfirmPassword("");
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Introduzca la contraseña
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
                <span className="text-[#0040DF] shrink-0">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Repita la contraseña
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
                <span className="text-[#0040DF] shrink-0">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ── EMPRESA VIEW ────────────────────────────────────────────────────────────
  if (tipo === "empresa") {
    const row = state?.data;
    const empresa = {
      id: row?.id ? `EMP-${String(row.id).slice(0, 8).toUpperCase()}` : "—",
      nombre: (row?.nombre as string) ?? "—",
      direccion: (row?.direccion as string) ?? "—",
      categorias: (row?.categorias as string[]) ?? [],
      estado: (row?.estado as string) ?? "—",
      miembroDesde: (row?._raw as { createdAt?: string } | undefined)?.createdAt
        ? formatDate((row?._raw as { createdAt: string }).createdAt)
        : "—",
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
                backgroundColor:
                  estadoRegistro === "archivado" ? "#64748B" : "#DC2626",
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
                      <span className={`font-semibold ${empresa.estado === "Activo" ? "text-green-600" : "text-gray-500"}`}>
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
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setEstadoRegistro("archivado");
                            setDropdownOpen(false);
                          }}
                        >
                          Archivar
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                          onClick={() => {
                            setPasswordModalOpen(true);
                            setDropdownOpen(false);
                          }}
                        >
                          Restablecer contraseña
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                          onClick={() => {
                            setEstadoRegistro(null);
                            setDropdownOpen(false);
                          }}
                        >
                          Restablecer
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100"
                          onClick={() => {
                            setDeleteModalOpen(true);
                            setDropdownOpen(false);
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {isCreateMode || isAdmin ? (
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
                      <div className="flex flex-wrap items-center gap-2">
                        {categoriasSeleccionadas.map((cat) => {
                          const cfg = CATEGORIA_COLORS[cat] ?? {
                            bg: "#F1F5F9",
                            color: "#64748B",
                          };
                          return (
                            <span
                              key={cat}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: cfg.bg,
                                color: cfg.color,
                              }}
                            >
                              {cat}
                            </span>
                          );
                        })}
                        <Button
                          text="Servicio"
                          icon={CirclePlus}
                          variant_classes="btn-sm bg-white border-2 border-dashed border-[#2563EB] text-[#2563EB] hover:bg-blue-50 hover:border-[#2563EB] hover:text-[#2563EB]"
                          onClick={() => {
                            setTempCategorias(categoriasSeleccionadas);
                            setCategoriaModalOpen(true);
                          }}
                        />
                      </div>
                    </div>
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
                      value={correo || "—"}
                      icon={<Mail size={14} />}
                    />
                    <Field
                      label="Número de Teléfono"
                      value={telefono || "—"}
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
                            const cfg = CATEGORIA_COLORS[cat] ?? {
                              bg: "#F1F5F9",
                              color: "#64748B",
                            };
                            return (
                              <span
                                key={cat}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: cfg.bg,
                                  color: cfg.color,
                                }}
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Empleados
              </h2>
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
            {companyDataLoading ? (
              <LoadingState message="Cargando…" />
            ) : companyWorkers.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Sin empleados registrados.</p>
            ) : (
              <List
                data={companyWorkers.map((w) => ({
                  id: w.id,
                  nombre: `${w.name} ${w.lastname}`,
                  telefono: w.phoneNumber ?? "—",
                  email: w.email,
                }))}
                columns={[
                  {
                    key: "nombre",
                    header: "Nombre y Apellido",
                    render: (row) => (
                      <span className="font-semibold text-gray-900">{row.nombre}</span>
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
                    onClick: (row) => {
                      const w = companyWorkers.find((worker) => worker.id === row.id);
                      if (!w) return;
                      navigate(ROUTES.DETALLES_USUARIO, {
                        state: {
                          tipo: "empleado",
                          origen: ROUTES.EMPRESAS,
                          data: {
                            id:        w.id,
                            nombre:    w.name,
                            apellido:  w.lastname,
                            correo:    w.email,
                            telefono:  w.phoneNumber ?? "",
                            empresa:   w.company?.name ?? String((state?.data as Record<string, unknown>)?.nombre ?? ""),
                            isActive:  w.isActive,
                            createdAt: w.createdAt,
                          },
                        },
                      });
                    },
                  },
                ]}
                itemsPerPage={5}
              />
            )}
          </div>
        )}

        {/* Reports list — view mode only */}
        {!isCreateMode && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Historial de Reportes
            </h2>
            {companyDataLoading ? (
              <LoadingState message="Cargando…" />
            ) : companyOwnReports.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Sin reportes registrados.</p>
            ) : (
              <List
                data={companyOwnReports.map(toReporteRow)}
                filters={[
                  { field: "servicio", label: "Servicio", type: "checkbox" },
                  { field: "tipo", label: "Tipo de Avería", type: "checkbox" },
                  { field: "estado", label: "Estado", type: "checkbox" },
                  { field: "fecha", label: "Buscar fecha", type: "text" },
                ]}
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
                    onClick: (row) => {
                      const r = companyOwnReports.find((rep) => rep.id === row.id);
                      if (!r) return;
                      navigate(ROUTES.DETALLES_REPORTE, {
                        state: {
                          mode: "view",
                          reporte: {
                            id:          r.id,
                            correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
                            empresa:     r.company?.name ?? "—",
                            servicio:    r.category.name,
                            categoryId:  r.category.id,
                            tipoAveria:  r.failureType?.name ?? "—",
                            prioridad:   r.priority,
                            estado:      r.state.name,
                            sector:      r.neighborhood?.name ?? "—",
                            responsable: r.assignedManager
                              ? `${r.assignedManager.name} ${r.assignedManager.lastname}`
                              : "",
                            creadoPor:   `${r.user.name} ${r.user.lastname}`,
                            descripcion: r.description,
                            address:     r.address ?? "",
                            latitude:    r.latitude,
                            longitude:   r.longitude,
                            createdAt:   r.createdAt,
                          },
                        },
                      });
                    },
                  },
                ]}
                itemsPerPage={5}
              />
            )}
          </div>
        )}
        <Modal
          isOpen={categoriaModalOpen}
          onClose={() => setCategoriaModalOpen(false)}
          title="Categorías de Servicio"
          confirmText="Confirmar"
          onConfirm={() => {
            setCategoriasSeleccionadas(tempCategorias);
            setCategoriaModalOpen(false);
          }}
        >
          <div className="flex flex-wrap gap-2 py-1">
            {TODAS_CATEGORIAS.map((cat) => {
              const cfg = CATEGORIA_COLORS[cat];
              const isSelected = tempCategorias.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setTempCategorias((prev) =>
                      prev.includes(cat)
                        ? prev.filter((c) => c !== cat)
                        : [...prev, cat],
                    )
                  }
                  className="px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
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
        </Modal>
        <Modal
          isOpen={passwordModalOpen}
          onClose={() => {
            setPasswordModalOpen(false);
            setResetPassword("");
            setResetConfirmPassword("");
          }}
          title="Restablecer contraseña"
          confirmText="Guardar"
          onConfirm={() => {
            setPasswordModalOpen(false);
            setResetPassword("");
            setResetConfirmPassword("");
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Introduzca la contraseña
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
                <span className="text-[#0040DF] shrink-0">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Repita la contraseña
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
                <span className="text-[#0040DF] shrink-0">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Eliminar registro"
          description="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
          confirmText="Sí, eliminar"
          confirmVariant="btn-error"
          onConfirm={() => setDeleteModalOpen(false)}
        />
      </div>
    );
  }

  // ── EMPLEADO VIEW ───────────────────────────────────────────────────────────
  if (tipo === "empleado") {
    const rowE = state?.data;
    const empleado = {
      id: rowE?.id ? String(rowE.id).slice(0, 8).toUpperCase() : "—",
      fullId: (rowE?.id as string) ?? "",
      nombreCompleto: [rowE?.nombre, rowE?.apellido].filter(Boolean).join(" ") || "—",
      correo: (rowE?.correo as string) ?? "—",
      telefono: (rowE?.telefono as string) || "—",
      empresaAsociada: (rowE?.empresa as string) ?? "—",
      estado: workerIsActive ? "Activo" : "Inactivo",
      miembroDesde: rowE?.createdAt ? formatDate(rowE.createdAt as string) : "—",
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
          {isCreateMode && (
            <Button
              text={saving ? "Registrando…" : "Registrar"}
              variant_classes="btn-primary"
              loading={saving}
              onClick={!saving ? handleCreateEmployee : undefined}
            />
          )}
        </div>

        {/* Info card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 relative overflow-hidden">
          {estadoRegistro && (
            <div
              className="absolute top-6 -right-9 w-40 text-center text-[11px] font-bold tracking-widest text-white py-1.5 z-10 pointer-events-none"
              style={{
                transform: "rotate(45deg)",
                backgroundColor:
                  estadoRegistro === "archivado" ? "#64748B" : "#DC2626",
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
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setEstadoRegistro("archivado");
                            setDropdownOpen(false);
                            authService.deactivateWorker(empleado.fullId)
                              .then(() => {
                                setWorkerIsActive(false);
                                toast.success("Empleado archivado.");
                              })
                              .catch((err) => {
                                console.error(err);
                                toast.error("No se pudo archivar el empleado.");
                              });
                          }}
                        >
                          Archivar
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                          onClick={() => {
                            setEstadoRegistro(null);
                            setDropdownOpen(false);
                            authService.activateWorker(empleado.fullId)
                              .then(() => {
                                setWorkerIsActive(true);
                                toast.success("Empleado restablecido.");
                              })
                              .catch((err) => {
                                console.error(err);
                                toast.error("No se pudo restablecer el empleado.");
                              });
                          }}
                        >
                          Restablecer
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                              onClick={() => {
                                setPasswordModalOpen(true);
                                setDropdownOpen(false);
                              }}
                            >
                              Restablecer contraseña
                            </button>
                            <button
                              type="button"
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100"
                              onClick={() => {
                                setDeleteModalOpen(true);
                                setDropdownOpen(false);
                              }}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {isCreateMode || isAdmin ? (
                  <>
                    <EditableField
                      label="Nombre"
                      value={nombre}
                      onChange={setNombre}
                      placeholder="Nombre"
                    />
                    <EditableField
                      label="Apellido"
                      value={apellido}
                      onChange={setApellido}
                      placeholder="Apellido"
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
                    {isAdmin && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                          Empresa Asociada
                        </p>
                        <SearchableSelect
                          placeholder="Buscar empresa..."
                          options={empresasOpciones}
                          value={empresaAsociada}
                          onChange={setEmpresaAsociada}
                        />
                      </div>
                    )}
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
            {assignedReportsLoading ? (
              <LoadingState message="Cargando reportes…" />
            ) : assignedReports.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
                <p className="text-gray-500 font-medium">Sin reportes asignados</p>
                <p className="text-xs text-gray-400 mt-1">
                  Los reportes asignados a este empleado aparecerán aquí.
                </p>
              </div>
            ) : (
              <List
                data={assignedReports.map(toReporteRow)}
                filters={[
                  { field: "servicio", label: "Servicio", type: "checkbox" },
                  { field: "estado", label: "Estado", type: "checkbox" },
                  { field: "tipo", label: "Buscar avería", type: "text" },
                ]}
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
                    onClick: (row) => {
                      const r = assignedReports.find((rep) => rep.id === row.id);
                      if (!r) return;
                      navigate(ROUTES.DETALLES_REPORTE, {
                        state: {
                          mode: "view",
                          reporte: {
                            id: r.id,
                            correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
                            empresa: r.company?.name ?? "—",
                            servicio: r.category.name,
                            categoryId: r.category.id,
                            tipoAveria: r.failureType?.name ?? "—",
                            prioridad: r.priority,
                            estado: r.state.name,
                            sector: r.neighborhood?.name ?? "—",
                            responsable: r.assignedManager
                              ? `${r.assignedManager.name} ${r.assignedManager.lastname}`
                              : "",
                            creadoPor: `${r.user.name} ${r.user.lastname}`,
                            descripcion: r.description,
                            address: r.address ?? "",
                            latitude: r.latitude,
                            longitude: r.longitude,
                            createdAt: r.createdAt,
                          },
                        },
                      });
                    },
                  },
                ]}
                itemsPerPage={5}
              />
            )}
          </div>
        )}
        <Modal
          isOpen={passwordModalOpen}
          onClose={() => {
            setPasswordModalOpen(false);
            setResetPassword("");
            setResetConfirmPassword("");
          }}
          title="Restablecer contraseña"
          confirmText="Guardar"
          onConfirm={() => {
            setPasswordModalOpen(false);
            setResetPassword("");
            setResetConfirmPassword("");
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Introduzca la contraseña
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
                <span className="text-[#0040DF] shrink-0">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Repita la contraseña
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
                <span className="text-[#0040DF] shrink-0">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Eliminar registro"
          description="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
          confirmText="Sí, eliminar"
          confirmVariant="btn-error"
          onConfirm={() => setDeleteModalOpen(false)}
        />
      </div>
    );
  }

  // ── REPORTANTE VIEW ─────────────────────────────────────────────────────────
  const rowR = state?.data;
  const reportante = {
    id: isSelfView ? (user?.id ?? "") : String(rowR?.id ?? ""),
    nombreCompleto: isSelfView
      ? `${nombre} ${apellido}`.trim()
      : [rowR?.nombre, rowR?.apellido].filter(Boolean).join(" ") || "—",
    correo: isSelfView
      ? (user?.email ?? "")
      : ((rowR?.email as string) || "—"),
    telefono: isSelfView
      ? (fetchedUserData?.phoneNumber ?? "...")
      : ((rowR?.telefono as string) || "—"),
    estado: isSelfView
      ? fetchedUserData
        ? fetchedUserData.isActive
          ? "Activo"
          : "Inactivo"
        : "Activo"
      : ((rowR?.estado as string) || "Activo"),
    miembroDesde: isSelfView
      ? fetchedUserData
        ? formatDate(fetchedUserData.createdAt)
        : "..."
      : rowR?.createdAt
        ? formatDate(rowR.createdAt as string)
        : "—",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Back link — hidden when viewing own profile */}
      {!isSelfView && !isAdminMiCuenta && (
        <button
          onClick={() => navigate(origen)}
          className="flex items-center gap-1.5 text-sm text-[#0040DF] font-medium hover:opacity-70 transition-opacity mb-3 cursor-pointer"
        >
          <ArrowLeft size={15} />
          Regresar a la lista
        </button>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isCreateMode
            ? "Nuevo Reportante"
            : isSelfView || isAdminMiCuenta
              ? "Mi Cuenta"
              : "Detalle de Usuario"}
        </h1>
        <Button
          text={
            saving
              ? isCreateMode ? "Registrando…" : "Guardando…"
              : isCreateMode ? "Registrar" : "Guardar Cambio"
          }
          variant_classes="btn-primary"
          loading={saving}
          disabled={saving}
          onClick={
            isCreateMode
              ? handleCreateReportante
              : (isSelfView || isAdminMiCuenta) && !saving
                ? handleSaveCitizen
                : undefined
          }
        />
      </div>

      {/* Info card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 relative min-h-[220px]">
        {estadoRegistro && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div
              className="absolute top-6 -right-9 w-40 text-center text-[11px] font-bold tracking-widest text-white py-1.5 z-10"
              style={{
                transform: "rotate(45deg)",
                backgroundColor:
                  estadoRegistro === "archivado" ? "#64748B" : "#DC2626",
              }}
            >
              {estadoRegistro === "archivado" ? "ARCHIVADO" : "CANCELADO"}
            </div>
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
                      {!isSelfView && (
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setEstadoRegistro("archivado");
                            setDropdownOpen(false);
                          }}
                        >
                          Archivar
                        </button>
                      )}
                      {!isSelfView && (
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setEstadoRegistro("cancelado");
                            setDropdownOpen(false);
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                        onClick={() => {
                          setPasswordModalOpen(true);
                          setDropdownOpen(false);
                        }}
                      >
                        Restablecer contraseña
                      </button>
                      {!isSelfView && (
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                          onClick={() => {
                            setEstadoRegistro(null);
                            setDropdownOpen(false);
                          }}
                        >
                          Restablecer
                        </button>
                      )}
                      {!isSelfView && (
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100"
                          onClick={() => {
                            setDeleteModalOpen(true);
                            setDropdownOpen(false);
                          }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {isCreateMode || isAdmin || isSelfView ? (
                <>
                  <EditableField
                    label="Nombre"
                    value={nombre}
                    onChange={setNombre}
                    placeholder="Nombre"
                  />
                  <EditableField
                    label="Apellido"
                    value={apellido}
                    onChange={setApellido}
                    placeholder="Apellido"
                  />
                  {isCreateMode ? (
                    <EditableField
                      label="Correo Electrónico"
                      value={correo}
                      onChange={setCorreo}
                      placeholder="reportante@email.com"
                      icon={<Mail size={14} />}
                    />
                  ) : (
                    <Field
                      label="Correo Electrónico"
                      value={correo}
                      icon={<Mail size={14} />}
                    />
                  )}
                  <EditableField
                    label="Número de Teléfono"
                    value={telefono}
                    onChange={setTelefono}
                    placeholder="+58 412 000 0000"
                    icon={<Phone size={14} />}
                  />
                  {isCreateMode && (
                    <EditableField
                      label="Contraseña"
                      value={password}
                      onChange={setPassword}
                      placeholder="••••••••"
                      type="password"
                      icon={<Lock size={14} />}
                    />
                  )}
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

          {isSelfView && reportesLoading && (
            <LoadingState message="Cargando reportes…" />
          )}

          {isSelfView && !reportesLoading && reportes.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
              <p className="text-gray-500 font-medium">
                No tienes reportes creados
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Cuando crees un reporte, aparecerá aquí.
              </p>
            </div>
          )}

          {!isSelfView && reportanteReportsLoading && (
            <LoadingState message="Cargando reportes…" />
          )}
          {!isSelfView && !reportanteReportsLoading && reportanteReports.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
              <p className="text-gray-500 font-medium">Sin reportes creados</p>
              <p className="text-xs text-gray-400 mt-1">
                Este usuario no ha creado reportes aún.
              </p>
            </div>
          )}
          {((!isSelfView && !reportanteReportsLoading && reportanteReports.length > 0) ||
            (isSelfView && !reportesLoading && reportes.length > 0)) && (
            <List
              data={
                isSelfView
                  ? reportes.map(toReporteRow)
                  : reportanteReports.map(toReporteRow)
              }
              filters={[
                { field: "servicio", label: "Servicio", type: "checkbox" },
                { field: "estado", label: "Estado", type: "checkbox" },
                { field: "tipo", label: "Buscar avería", type: "text" },
              ]}
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
                  onClick: (row) => {
                    const source = isSelfView ? reportes : reportanteReports;
                    const r = source.find((rep) => rep.id === row.id);
                    if (!r) return;
                    navigate(ROUTES.DETALLES_REPORTE, {
                      state: {
                        mode: "view",
                        reporte: {
                          id: r.id,
                          correlativo: `#URB-${r.id.slice(0, 8).toUpperCase()}`,
                          empresa: r.company?.name ?? "—",
                          servicio: r.category.name,
                          categoryId: r.category.id,
                          tipoAveria: r.failureType?.name ?? "—",
                          prioridad: r.priority,
                          estado: r.state.name,
                          sector: r.neighborhood?.name ?? "—",
                          responsable: r.assignedManager
                            ? `${r.assignedManager.name} ${r.assignedManager.lastname}`
                            : "",
                          creadoPor: `${r.user.name} ${r.user.lastname}`,
                          descripcion: r.description,
                          address: r.address ?? "",
                          latitude: r.latitude,
                          longitude: r.longitude,
                          createdAt: r.createdAt,
                        },
                      },
                    });
                  },
                },
              ]}
              itemsPerPage={5}
            />
          )}
        </div>
      )}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setResetPassword("");
          setResetConfirmPassword("");
        }}
        title="Restablecer contraseña"
        confirmText="Guardar"
        onConfirm={() => {
          setPasswordModalOpen(false);
          setResetPassword("");
          setResetConfirmPassword("");
        }}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Introduzca la contraseña
            </p>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
              <span className="text-[#0040DF] shrink-0">
                <Lock size={14} />
              </span>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Repita la contraseña
            </p>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0F4FF]">
              <span className="text-[#0040DF] shrink-0">
                <Lock size={14} />
              </span>
              <input
                type="password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar registro"
        description="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        confirmVariant="btn-error"
        onConfirm={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
