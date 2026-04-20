import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Info,
  MapPin,
  Users,
  ImageIcon,
  Camera,
  CalendarDays,
  UserCircle2,
  History,
  ArrowRight,
  Settings,
} from "lucide-react";
import { Map } from "../components/layout";
import { Button } from "../components/ui";
import CustomSelect from "../components/ui/CustomSelect";
import { useAuth } from "../context/AuthContext";

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

// ── Tipos de log ─────────────────────────────────
type LogEntry = {
  id: number;
  fecha: string;
  usuario: string;
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
};

type Snapshot = {
  empresa: string;
  categoria: string;
  tipoAveria: string;
  estado: string;
  descripcion: string;
  calle: string;
  vecindario: string;
  responsable: string;
};

const SNAPSHOT_VACIO: Snapshot = {
  empresa: "",
  categoria: "",
  tipoAveria: "",
  estado: "",
  descripcion: "",
  calle: "",
  vecindario: "",
  responsable: "",
};

const LABELS: Record<keyof Snapshot, string> = {
  empresa: "Empresa",
  categoria: "Categoría",
  tipoAveria: "Tipo de Avería",
  estado: "Estado",
  descripcion: "Descripción",
  calle: "Calle",
  vecindario: "Vecindario / Barrio",
  responsable: "Responsable Asignado",
};

// Coordenadas aproximadas por sector para el pin de vista
const SECTOR_COORDS: Record<string, [number, number]> = {
  "Unare":         [-62.753, 8.281],
  "Sierra Parima": [-62.737, 8.286],
  "La Llanada":    [-62.667, 8.295],
  "Centro":        [-62.705, 8.296],
};

function formatLat(lat: number) { return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`; }
function formatLng(lng: number) { return `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`; }

// ── Tipo del reporte que llega por navigate state ─
type ReporteState = {
  id: number;
  correlativo: string;
  empresa: string;
  servicio: string;
  prioridad: string;
  estado: string;
  sector: string;
  responsable: string;
  creadoPor: string;
};

type LocationState = {
  mode?: "new" | "view";
  reporte?: ReporteState;
  counters?: { A: number; L: number; U: number };
} | null;

// ── Helpers de mapeo ─────────────────────────────
function mapServicioToCategoria(servicio: string): string {
  if (servicio === "Agua") return "Agua Potable";
  return servicio;
}

function mapEstadoToForm(estado: string): string {
  const MAP: Record<string, string> = {
    Revisión: "En Proceso",
    Resuelto: "Completado",
  };
  return MAP[estado] ?? estado;
}

// ────────────────────────────────────────────────
export default function DetallesReporte() {
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState;

  const reporte = state?.reporte ?? null;
  const isViewMode = !!reporte;
  const isWorker = user?.role === "worker";
  const isAdmin = user?.role === "admin";
  const isCitizen = user?.role === "citizen";

  // Coords para el pin del mapa
  const reportePinCoords = reporte?.sector ? SECTOR_COORDS[reporte.sector] : undefined;
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);

  // ro(field): true → campo de solo lectura
  const ro = (field: string) => isWorker && field !== "estado";

  const [imagenes, setImagenes] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // ── Correlativo ───────────────────────────────
  const [correlativo, setCorrelativo] = useState(reporte?.correlativo ?? "");

  // ── Estado de cada campo editable ──────────────
  const [categoria, setCategoria] = useState(
    reporte ? mapServicioToCategoria(reporte.servicio) : "",
  );
  const [tipoAveria, setTipoAveria] = useState("");
  const [estado, setEstado] = useState(
    reporte ? mapEstadoToForm(reporte.estado) : "",
  );
  const [descripcion, setDescripcion] = useState("");
  const [calle, setCalle] = useState("");
  const [vecindario, setVecindario] = useState(reporte?.sector ?? "");
  const [responsable, setResponsable] = useState(reporte?.responsable ?? "");
  const [empresa, setEmpresa] = useState(reporte?.empresa ?? "");

  // ── Snapshot (último estado guardado) ──────────
  const [snapshot, setSnapshot] = useState<Snapshot>(
    reporte
      ? {
          empresa: reporte.empresa,
          categoria: mapServicioToCategoria(reporte.servicio),
          tipoAveria: "",
          estado: mapEstadoToForm(reporte.estado),
          descripcion: "",
          calle: "",
          vecindario: reporte.sector,
          responsable: reporte.responsable,
        }
      : SNAPSHOT_VACIO,
  );

  // ── Historial de cambios ────────────────────────
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const tiposAveria = categoria
    ? [...(TIPOS_POR_CATEGORIA[categoria] ?? []), "Otro"]
    : ["Otro"];

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setImagenes((prev) => [...prev, ...Array.from(e.target.files!)]);
  }

  function handleGuardar() {
    const current: Snapshot = {
      empresa,
      categoria,
      tipoAveria,
      estado,
      descripcion,
      calle,
      vecindario,
      responsable,
    };

    const ahora = new Date().toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const nuevosLogs: LogEntry[] = (Object.keys(current) as (keyof Snapshot)[])
      .filter(
        (key) =>
          current[key] !== snapshot[key] &&
          (current[key] !== "" || snapshot[key] !== ""),
      )
      .map((key, i) => ({
        id: Date.now() + i,
        fecha: ahora,
        usuario: user?.name ?? "Admin_Urbis_01",
        campo: LABELS[key],
        valorAnterior: snapshot[key] || "—",
        valorNuevo: current[key] || "—",
      }));

    if (nuevosLogs.length > 0) {
      setLogs((prev) => [...prev, ...nuevosLogs]);
      setSnapshot(current);
    }
  }

  function handleRegistrar() {
    if (categoria && !correlativo) {
      const prefix =
        categoria === "Agua Potable"
          ? "A"
          : categoria === "Electricidad"
            ? "L"
            : "U";
      const counters = state?.counters ?? { A: 5, L: 3, U: 4 };
      const count = (counters[prefix as "A" | "L" | "U"] ?? 0) + 1;
      setCorrelativo(`#${prefix}-${String(count).padStart(5, "0")}`);
    }
    handleGuardar();
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
                backgroundColor: estadoRegistro === "archivado" ? "#64748B" : "#DC2626",
              }}
            >
              {estadoRegistro === "archivado" ? "ARCHIVADO" : "CANCELADO"}
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
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        onClick={() => { setEstadoRegistro("archivado"); setDropdownOpen(false); }}
                      >
                        Archivar
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={() => { setEstadoRegistro("cancelado"); setDropdownOpen(false); }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                        onClick={() => { setEstadoRegistro(null); setDropdownOpen(false); }}
                      >
                        Restablecer
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

            <Field label="Empresa">
              {ro("empresa") ? (
                <div className={inputClass} style={readonlyStyle}>
                  {empresa || "—"}
                </div>
              ) : (
                <CustomSelect
                  placeholder="Selecciona una empresa"
                  options={[
                    "Aguas del Norte",
                    "Energía Urbana",
                    "Metrogas Central",
                    "Limpieza Regional",
                  ]}
                  value={empresa}
                  onChange={setEmpresa}
                />
              )}
            </Field>

            <Field label="Categoría">
              {ro("categoria") ? (
                <div className={inputClass} style={readonlyStyle}>
                  {categoria || "—"}
                </div>
              ) : (
                <CustomSelect
                  placeholder="Selecciona una categoría"
                  options={CATEGORIAS}
                  value={categoria}
                  onChange={(v) => {
                    setCategoria(v);
                    setTipoAveria("");
                  }}
                />
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de Avería">
                {ro("tipoAveria") ? (
                  <div className={inputClass} style={readonlyStyle}>
                    {tipoAveria || "—"}
                  </div>
                ) : (
                  <CustomSelect
                    key={categoria}
                    placeholder="Selecciona un tipo"
                    options={tiposAveria}
                    value={tipoAveria}
                    onChange={setTipoAveria}
                  />
                )}
              </Field>
              <Field label="Estado">
                <CustomSelect
                  placeholder="Selecciona un estado"
                  options={[
                    "En Proceso",
                    "Pendiente",
                    "Asignado",
                    "Completado",
                  ]}
                  value={estado}
                  onChange={setEstado}
                />
              </Field>
            </div>

            <Field label="Descripción Detallada">
              <textarea
                rows={4}
                placeholder="Describa el problema observado con el mayor detalle posible..."
                className={`${inputClass} resize-none${ro("descripcion") ? " cursor-default" : ""}`}
                style={readonlyStyle}
                value={descripcion}
                readOnly={ro("descripcion")}
                onChange={(e) => setDescripcion(e.target.value)}
              />
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

                <Field label="Vecindario / Barrio">
                  <input
                    type="text"
                    placeholder="Centro Histórico"
                    className={`${inputClass}${ro("vecindario") ? " cursor-default" : ""}`}
                    style={readonlyStyle}
                    value={vecindario}
                    readOnly={ro("vecindario")}
                    onChange={(e) => setVecindario(e.target.value)}
                  />
                </Field>

                <Field label="Coordenadas GPS">
                  <div className="grid grid-cols-2 gap-2">
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
                </Field>
              </div>

              {/* Mapa */}
              <div className="h-[260px] rounded-xl">
                <Map
                  pinCoords={isViewMode ? reportePinCoords : undefined}
                  editPin={!isViewMode && (isAdmin || isCitizen)}
                  onPinChange={(coords) => setSelectedCoords(coords)}
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
                    {reporte?.creadoPor ?? "Admin_Urbis_01"}
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
                    12/10/2023 14:30
                  </span>
                </div>
              </Field>

              <div className="col-span-2">
                <Field label="Responsable Asignado">
                  {ro("responsable") ? (
                    <div className={inputClass} style={readonlyStyle}>
                      {responsable || "—"}
                    </div>
                  ) : (
                    <CustomSelect
                      placeholder="Selecciona un responsable"
                      options={[
                        "Ing. Roberto Méndez",
                        "Ing. Laura Castillo",
                        "Téc. Pedro Suárez",
                        "Téc. Ana Flores",
                      ]}
                      value={responsable}
                      onChange={setResponsable}
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
              {!isWorker && (
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
              onClick={isViewMode ? handleGuardar : handleRegistrar}
            />
            <Button
              text="Cancelar"
              variant_classes="bg-[#e21313] text-[white] w-full h-12 text-base"
            />
          </div>
        </div>
      </div>

      {/* ── Historial de Cambios ── */}
      <div className={`${cardClass} mt-5`}>
        <div className={sectionTitleClass}>
          <History size={17} color="#0040DF" />
          <span>Historial de Cambios</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Aún no hay cambios registrados. Modifica campos y guarda para ver el
            historial.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {[...logs].reverse().map((log, idx, arr) => (
              <div
                key={log.id}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                {/* Timeline indicator */}
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  <div className="w-8 h-8 rounded-full bg-[#0040DF]/10 flex items-center justify-center shrink-0">
                    <UserCircle2 size={16} color="#0040DF" />
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  )}
                </div>

                {/* Log content */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-800">
                      {log.usuario}
                    </span>
                    <span className="text-xs text-gray-400">{log.fecha}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Modificó{" "}
                    <span className="font-semibold text-gray-700">
                      {log.campo}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-500 text-xs line-through">
                      {log.valorAnterior}
                    </span>
                    <ArrowRight size={13} className="text-gray-400 shrink-0" />
                    <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-medium">
                      {log.valorNuevo}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
