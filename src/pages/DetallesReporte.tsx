import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import {
  Info,
  MapPin,
  Users,
  ImageIcon,
  Camera,
  CalendarDays,
  Settings,
} from "lucide-react";
import { Map } from "../components/layout";
import { Button } from "../components/ui";
import CustomSelect from "../components/ui/CustomSelect";
import { useAuth } from "../context/AuthContext";
import { useCategories, useFailureTypesByCategory, useCompaniesByCategory, useWorkers } from "../hooks/useQueryHooks";
import { reportsService } from "../services/reports.service";

// ── Reutilizable: etiqueta + campo ──────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      {children}
    </div>
  );
}

// ── Estilos compartidos ──────────────────────────
const inputClass =
  "w-full px-4 py-3 rounded-xl text-sm outline-none text-gray-700 transition-colors";
const readonlyStyle = { backgroundColor: "#F0F4FF" };
const cardClass =
  "bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4";
const sectionTitleClass = "flex items-center gap-2 font-semibold text-gray-800";

// ── Tipos de avería por categoría ───────────────
const TIPOS_POR_CATEGORIA: Record<string, string[]> = {
  "Agua Potable": [
    "Fuga de agua",
    "Tubería madre",
    "Presión insuficiente",
    "Agua contaminada",
  ],
  Electricidad: [
    "Corte de suministro",
    "Sobrecarga eléctrica",
    "Transformador dañado",
    "Cable caído",
  ],
  "Aseo Urbano": [
    "Basura acumulada",
    "Contenedor dañado",
    "Falta de recolección",
    "Vertedero ilegal",
  ],
};

const CATEGORIAS = Object.keys(TIPOS_POR_CATEGORIA);

function formatLat(lat: number) { return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`; }
function formatLng(lng: number) { return `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`; }

// ── Tipo del reporte que llega por navigate state ─
type ReporteState = {
  id: string;
  correlativo: string;
  empresa: string;
  servicio: string;
  categoryId: string;
  tipoAveria: string;
  prioridad: string;
  estado: string;
  sector: string;
  responsable: string;
  creadoPor: string;
  descripcion?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
};

type LocationState = {
  mode?: "new" | "view";
  reporte?: ReporteState;
  counters?: { A: number; L: number; U: number };
  companyView?: "dirigidos" | "propios";
} | null;

// ── Helpers de mapeo ─────────────────────────────
function mapServicioToCategoria(servicio: string): string {
  if (servicio === "Agua") return "Agua Potable";
  return servicio;
}

function mapEstadoToForm(estado: string): string {
  const MAP: Record<string, string> = {
    Revisión:   "En Proceso",
    Resuelto:   "Completado",
    PENDIENTE:  "Pendiente",
    EN_PROCESO: "En Proceso",
    COMPLETADO: "Completado",
    CANCELADO:  "Cancelado",
  };
  return MAP[estado] ?? estado;
}

// ────────────────────────────────────────────────
export default function DetallesReporte() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const reporte = state?.reporte ?? null;
  const isViewMode = !!reporte;
  const isWorker = user?.role === "worker";
  const isAdmin = user?.role === "admin";
  const isCitizen = user?.role === "citizen";
  const isCompany = user?.role === "company";
  // Company viewing one of their own reports ("Mis Reportes") → same restrictions as citizen
  const isCompanyOwnReport = isCompany && state?.companyView === "propios";

  const isCompanyDirigidos = isCompany && !isCompanyOwnReport && isViewMode;

  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [reportePinCoords, setReportePinCoords] = useState<[number, number] | undefined>(() => {
    if (reporte?.longitude != null && reporte?.latitude != null) {
      return [reporte.longitude, reporte.latitude];
    }
    return undefined;
  });

  // ro(field): true → campo de solo lectura
  const ro = (field: string) => {
    if (isCompanyDirigidos && isViewMode && (field === "estado" || field === "responsable")) return false;
    if (isWorker && isViewMode && field === "estado") return false;
    return isViewMode;
  };

  const [imagenes, setImagenes] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [estadoRegistro, setEstadoRegistro] = useState<"cancelado" | null>(
    reporte?.estado?.toUpperCase() === "CANCELADO" ? "cancelado" : null
  );
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

  const [showErrors, setShowErrors] = useState(false);

  // ── Catalog data ─────────────────────────────
  const [companiesOptions, setCompaniesOptions] = useState<string[]>([]);
  const [companiesMap, setCompaniesMap]           = useState<Record<string, string>>({});
  const [categoriesOptions, setCategoriesOptions] = useState<string[]>([]);
  const [categoriesMap, setCategoriesMap]         = useState<Record<string, string>>({});
  const [failureTypesOptions, setFailureTypesOptions] = useState<string[]>([]);
  const [failureTypesMap, setFailureTypesMap]     = useState<Record<string, number>>({});

  // Workers (company view mode only)
  const [workersOptions, setWorkersOptions] = useState<string[]>([]);
  const [workersMap, setWorkersMap] = useState<Record<string, string>>({});

  // ── Correlativo ───────────────────────────────
  const [correlativo] = useState(reporte?.correlativo ?? "");

  // ── Estado de cada campo editable ──────────────
  const [categoria, setCategoria] = useState(
    reporte ? mapServicioToCategoria(reporte.servicio) : "",
  );
  const [categoriaId, setCategoriaId] = useState(reporte?.categoryId ?? "");
  const [tipoAveria, setTipoAveria] = useState(reporte?.tipoAveria ?? "");
  const [estado, setEstado] = useState(
    reporte ? mapEstadoToForm(reporte.estado) : "En Proceso",
  );
  const [descripcion, setDescripcion] = useState(reporte?.descripcion ?? "");
  const [calle, setCalle] = useState(reporte?.address ?? "");
  const [vecindario, setVecindario] = useState(reporte?.sector ?? "");
  const [viewCreatedAt] = useState(() => {
    if (!reporte?.createdAt) return "";
    return new Date(reporte.createdAt).toLocaleDateString("es-VE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  });
  const [responsable, setResponsable] = useState(reporte?.responsable ?? "");
  const [empresa, setEmpresa] = useState(reporte?.empresa ?? "");

  const shouldFetchWorkers = isViewMode && isCompany && !isCompanyOwnReport && !!user?.name;
  const { data: _categories = [] } = useCategories();
  const { data: _failureTypes = [] } = useFailureTypesByCategory(categoriaId);
  const { data: _companies = [] } = useCompaniesByCategory(!isViewMode ? categoria : "");
  const { data: _workers = [] } = useWorkers(user?.name, shouldFetchWorkers);

  // Bridge: categories → options/map (create mode only)
  useEffect(() => {
    if (isViewMode || !_categories.length) return;
    setCategoriesOptions(_categories.map((c) => c.name));
    const m: Record<string, string> = {};
    _categories.forEach((c) => { m[c.name] = c.id; });
    setCategoriesMap(m);
  }, [_categories, isViewMode]);

  // Bridge: failure types → options/map (create mode + admin view mode)
  useEffect(() => {
    if (!_failureTypes.length) return;
    setFailureTypesOptions(_failureTypes.map((ft) => ft.name));
    const m: Record<string, number> = {};
    _failureTypes.forEach((ft) => { m[ft.name] = ft.id; });
    setFailureTypesMap(m);
  }, [_failureTypes]);

  // Bridge: companies by category → options/map (create mode only)
  useEffect(() => {
    if (isViewMode || !_companies.length) return;
    const filtered = _companies.filter((c) => c.name !== user?.name);
    setCompaniesOptions(filtered.map((c) => c.name));
    const m: Record<string, string> = {};
    filtered.forEach((c) => { m[c.name] = c.id; });
    setCompaniesMap(m);
  }, [_companies, isViewMode]);

  // Bridge: workers → options/map (company directed view only)
  useEffect(() => {
    if (!shouldFetchWorkers || !_workers.length) return;
    setWorkersOptions(_workers.map((w) => `${w.name} ${w.lastname}`));
    const m: Record<string, string> = {};
    _workers.forEach((w) => { m[`${w.name} ${w.lastname}`] = w.id; });
    setWorkersMap(m);
  }, [_workers, shouldFetchWorkers]);

  function handleCategoriaChange(name: string) {
    setCategoria(name);
    const id = categoriesMap[name] ?? "";
    setCategoriaId(id);
    setTipoAveria("");
    setEmpresa("");
    setFailureTypesOptions([]);
    setFailureTypesMap({});
    setCompaniesOptions([]);
    setCompaniesMap({});
  }

  const tiposAveria = failureTypesOptions.length > 0
    ? failureTypesOptions
    : isViewMode
      ? [...(TIPOS_POR_CATEGORIA[categoria] ?? []), "Otro"]
      : [];

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setImagenes((prev) => [...prev, ...Array.from(e.target.files!)]);
  }

  async function handleGuardarCambios() {
    if (!reporte?.id) return;
    try {
      const promises: Promise<unknown>[] = [];

      if (isWorker) {
        const workerEstadoMap: Record<string, "COMPLETADO" | "CANCELADO"> = {
          "Completado": "COMPLETADO",
          "Cancelado":  "CANCELADO",
        };
        const backendEstado = workerEstadoMap[estado];
        if (backendEstado) {
          promises.push(reportsService.updateStatus(reporte.id, backendEstado));
        }
      } else if (isCompanyDirigidos) {
        const estadoBackendMap: Record<string, "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO"> = {
          "Pendiente":  "PENDIENTE",
          "En Proceso": "EN_PROCESO",
          "Completado": "COMPLETADO",
          "Cancelado":  "CANCELADO",
        };
        const backendEstado = estadoBackendMap[estado];
        if (backendEstado) {
          promises.push(reportsService.updateStatus(reporte.id, backendEstado));
        }
        if (workersMap[responsable]) {
          promises.push(reportsService.assign(reporte.id, workersMap[responsable]));
        }
      } else {
        if (descripcion.trim() || failureTypesMap[tipoAveria]) {
          promises.push(reportsService.update(reporte.id, {
            ...(descripcion.trim() && { description: descripcion.trim() }),
            ...(failureTypesMap[tipoAveria] && { failureTypeId: failureTypesMap[tipoAveria] }),
          }));
        }
      }

      await Promise.all(promises);
    } catch (err) {
      console.error("Error al guardar cambios:", err);
    }
  }

  async function handleRegistrar() {
    const camposInvalidos =
      !categoria || !empresa || !tipoAveria || !descripcion.trim() || !selectedCoords;
    if (camposInvalidos) {
      setShowErrors(true);
      return;
    }
    try {
      await reportsService.create({
        description: descripcion,
        latitude: selectedCoords[1],
        longitude: selectedCoords[0],
        categoryId: categoriesMap[categoria],
        ...(companiesMap[empresa] && { companyId: companiesMap[empresa] }),
        ...(failureTypesMap[tipoAveria] && { failureTypeId: failureTypesMap[tipoAveria] }),
        ...(calle && { address: calle }),
      });
      navigate(ROUTES.REPORTES);
    } catch (err) {
      console.error("Error al crear reporte:", err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* ── Header ── */}
      <div className="mb-6">
        <small className="text-[#0040DF] font-bold">Detalles de Reporte</small>
        <h1 className="text-2xl font-bold">
          {isViewMode ? "Editando Reporte" : "Nuevo Reporte de Avería"}
        </h1>
      </div>

      {/* ── Grid 2 columnas asimétricas ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "3fr 2fr" }}>
        {/* ══════════ COLUMNA IZQUIERDA ══════════ */}
        <div className="flex flex-col gap-5 relative overflow-hidden">
          {/* Ribbon de estado */}
          {estadoRegistro && (
            <div
              className="absolute top-6 -right-9 w-40 text-center text-[11px] font-bold tracking-widest text-white py-1.5 z-10 pointer-events-none"
              style={{
                transform: "rotate(45deg)",
                backgroundColor: "#DC2626",
              }}
            >
              CANCELADO
            </div>
          )}

          {/* Card: Información del Reporte */}
          <div className={cardClass}>
            <div className={sectionTitleClass}>
              <Info size={17} color="#0040DF" />
              <span>Información del Reporte</span>
              {isViewMode && !isWorker && (
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => setDropdownOpen((v) => !v)}
                  >
                    <Settings size={17} color="#64748B" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={async () => {
                          if (!reporte?.id) return;
                          try {
                            const res = await reportsService.updateStatus(reporte.id, "CANCELADO");
                            const estadoActualizado = res.data.report.state.name;
                            if (estadoActualizado === "CANCELADO") {
                              setEstadoRegistro("cancelado");
                              setEstado("Cancelado");
                            }
                          } catch (err) {
                            console.error("Error al cancelar reporte:", err);
                          } finally {
                            setDropdownOpen(false);
                          }
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Número de Reporte */}
            {correlativo && (
              <p className="text-2xl font-bold">
                <span className="text-[#64748B]">{correlativo}</span>
              </p>
            )}

            <Field label="Categoría">
              {ro("categoria") ? (
                <div className={inputClass} style={readonlyStyle}>
                  {categoria || "—"}
                </div>
              ) : (
                <>
                  <div className={!isViewMode && showErrors && !categoria ? "rounded-xl ring-2 ring-red-400" : ""}>
                    <CustomSelect
                      placeholder="Selecciona una categoría"
                      options={isViewMode ? CATEGORIAS : categoriesOptions}
                      value={categoria}
                      onChange={isViewMode
                        ? (v) => { setCategoria(v); setTipoAveria(""); }
                        : handleCategoriaChange
                      }
                    />
                  </div>
                  {!isViewMode && showErrors && !categoria && (
                    <span className="text-xs text-red-500">Campo obligatorio</span>
                  )}
                </>
              )}
            </Field>

            <Field label="Empresa">
              {ro("empresa") ? (
                <div className={inputClass} style={readonlyStyle}>
                  {empresa || "—"}
                </div>
              ) : (
                <>
                  <div className={!isViewMode && showErrors && !empresa ? "rounded-xl ring-2 ring-red-400" : ""}>
                    <CustomSelect
                      key={categoriaId}
                      placeholder="Selecciona una empresa"
                      options={isViewMode
                        ? ["Aguas del Norte", "Energía Urbana", "Metrogas Central", "Limpieza Regional"]
                        : companiesOptions
                      }
                      value={empresa}
                      onChange={setEmpresa}
                      disabled={!isViewMode && !categoriaId}
                    />
                  </div>
                  {!isViewMode && showErrors && !empresa && (
                    <span className="text-xs text-red-500">Campo obligatorio</span>
                  )}
                </>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de Avería">
                {isWorker || isCompanyDirigidos ? (
                  <div className={inputClass} style={readonlyStyle}>
                    {tipoAveria || "—"}
                  </div>
                ) : (
                  <>
                    <div className={!isViewMode && showErrors && !tipoAveria ? "rounded-xl ring-2 ring-red-400" : ""}>
                      <CustomSelect
                        key={categoria}
                        placeholder="Selecciona un tipo"
                        options={tiposAveria}
                        value={tipoAveria}
                        onChange={setTipoAveria}
                        disabled={!isViewMode && !categoriaId}
                      />
                    </div>
                    {!isViewMode && showErrors && !tipoAveria && (
                      <span className="text-xs text-red-500">Campo obligatorio</span>
                    )}
                  </>
                )}
              </Field>
              <Field label="Estado">
                {ro("estado") ? (
                  <div className={inputClass} style={readonlyStyle}>
                    {estado || "—"}
                  </div>
                ) : (
                  <CustomSelect
                    placeholder="Selecciona un estado"
                    options={isWorker ? ["Cancelado", "Completado"] : ["Pendiente", "En Proceso", "Completado", "Cancelado"]}
                    value={estado}
                    onChange={setEstado}
                    disabled={isCitizen || (isCompany && !isViewMode)}
                  />
                )}
              </Field>
            </div>

            <Field label="Descripción Detallada">
              <textarea
                rows={4}
                placeholder="Describa el problema observado con el mayor detalle posible..."
                className={`${inputClass} resize-none${isWorker ? " cursor-default" : ""}${!isViewMode && showErrors && !descripcion.trim() ? " ring-2 ring-red-400" : ""}`}
                style={readonlyStyle}
                value={descripcion}
                readOnly={isWorker || isCompanyDirigidos}
                onChange={(e) => setDescripcion(e.target.value)}
              />
              {!isViewMode && showErrors && !descripcion.trim() && (
                <span className="text-xs text-red-500">Campo obligatorio</span>
              )}
            </Field>

            <div className={sectionTitleClass}>
              <MapPin size={17} color="#0040DF" />
              <span>Ubicación Geográfica</span>
            </div>
            <small>
              Seleccione el punto en el mapa donde presenta la averia
            </small>

            <div className="grid grid-cols-2 gap-4">
              {/* Campos de ubicación */}
              <div className="flex flex-col gap-3">
                <Field label="Calle">
                  <input
                    type="text"
                    placeholder="Av. de la Constitución 45"
                    className={`${inputClass}${ro("calle") ? " cursor-default" : ""}`}
                    style={readonlyStyle}
                    value={calle}
                    readOnly={ro("calle")}
                    onChange={(e) => setCalle(e.target.value)}
                  />
                </Field>



                <Field label="Coordenadas GPS">
                  <div className={`grid grid-cols-2 gap-2${!isViewMode && showErrors && !selectedCoords ? " ring-2 ring-red-400 rounded-xl" : ""}`}>
                    <input
                      type="text"
                      readOnly
                      value={
                        isViewMode && reportePinCoords
                          ? formatLat(reportePinCoords[1])
                          : selectedCoords
                          ? formatLat(selectedCoords[1])
                          : "—"
                      }
                      className={`${inputClass} text-gray-400 cursor-default`}
                      style={readonlyStyle}
                    />
                    <input
                      type="text"
                      readOnly
                      value={
                        isViewMode && reportePinCoords
                          ? formatLng(reportePinCoords[0])
                          : selectedCoords
                          ? formatLng(selectedCoords[0])
                          : "—"
                      }
                      className={`${inputClass} text-gray-400 cursor-default`}
                      style={readonlyStyle}
                    />
                  </div>
                  {!isViewMode && showErrors && !selectedCoords && (
                    <span className="text-xs text-red-500">Selecciona un punto en el mapa</span>
                  )}
                </Field>
              </div>

              {/* Mapa */}
              <div className="h-[260px] rounded-xl">
                <Map
                  pinCoords={isViewMode ? reportePinCoords : undefined}
                  editPin={!isViewMode && (isAdmin || isCitizen || isCompany)}
                  onPinChange={async (coords) => {
                    setSelectedCoords(coords);
                    if (!coords) return;
                    try {
                      const res = await reportsService.getAddress(coords[1], coords[0]);
                      const addr = res.data.address;
                      setCalle(addr.street ?? addr.formatted ?? "");
                      setVecindario(addr.neighborhood ?? addr.quarter ?? addr.village ?? "");
                    } catch {
                      // el usuario puede rellenar manualmente si falla
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ COLUMNA DERECHA ══════════ */}
        <div className="flex flex-col gap-5">
          {/* Card: Asignación */}
          <div className={cardClass}>
            <div className={sectionTitleClass}>
              <Users size={17} color="#0040DF" />
              <span>Asignación</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Usuario Creador">
                <div
                  className="flex items-center gap-2 px-3 py-3 rounded-xl"
                  style={readonlyStyle}
                >
                  <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                    {isViewMode
                      ? (reporte?.creadoPor ?? "—")
                      : `${user?.name ?? ""} ${user?.lastname ?? ""}`.trim()}
                  </span>
                </div>
              </Field>

              <Field label="Fecha de Creación">
                <div
                  className="flex items-center gap-2 px-3 py-3 rounded-xl"
                  style={readonlyStyle}
                >
                  <CalendarDays size={15} color="#0040DF" />
                  <span className="text-sm text-gray-700">
                    {isViewMode
                      ? (viewCreatedAt || "—")
                      : new Date().toLocaleDateString("es-VE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                  </span>
                </div>
              </Field>

              <div className="col-span-2">
                <Field label="Responsable Asignado">
                  {!isViewMode || ro("responsable") ? (
                    <div className={inputClass} style={readonlyStyle}>
                      {isViewMode ? (responsable || "—") : "—"}
                    </div>
                  ) : (
                    <CustomSelect
                      placeholder="Selecciona un responsable"
                      options={workersOptions}
                      value={responsable}
                      onChange={setResponsable}
                      disabled={workersOptions.length === 0}
                    />
                  )}
                </Field>
              </div>
            </div>
          </div>

          {/* Card: Evidencia Visual */}
          <div className={cardClass}>
            <div className={sectionTitleClass}>
              <ImageIcon size={17} color="#0040DF" />
              <span>Evidencia Visual</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {!isWorker && !isCompanyDirigidos && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl h-28 flex flex-col items-center justify-center gap-1.5 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <Camera size={20} color="#94A3B8" />
                  <span className="text-xs font-semibold text-gray-400 tracking-wide">
                    SUBIR
                  </span>
                </button>
              )}

              {imagenes.map((file, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(file)}
                  alt={`evidencia-${i}`}
                  className="h-28 w-full rounded-xl object-cover"
                />
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png,application/pdf"
              multiple
              hidden
              onChange={handleFiles}
            />

            <p className="text-xs text-gray-400">
              Formatos permitidos: JPG, PNG, PDF. Máx 5MB por archivo.
            </p>
          </div>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              text={isViewMode ? "Guardar Cambios" : "Registrar"}
              variant_classes="btn-primary w-full h-12 text-base"
              onClick={isViewMode ? handleGuardarCambios : handleRegistrar}
            />
            <Button
              text="Cancelar"
              variant_classes="bg-[#e21313] text-[white] w-full h-12 text-base"
              onClick={() => navigate(ROUTES.REPORTES)}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
