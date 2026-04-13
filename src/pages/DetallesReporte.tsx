import { useRef, useState } from "react";
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
  categoria: string;
  tipoAveria: string;
  estado: string;
  descripcion: string;
  servicioAfectado: string;
  calle: string;
  vecindario: string;
  responsable: string;
  compania: string;
};

const SNAPSHOT_VACIO: Snapshot = {
  categoria: "",
  tipoAveria: "",
  estado: "",
  descripcion: "",
  servicioAfectado: "",
  calle: "",
  vecindario: "",
  responsable: "",
  compania: "",
};

const LABELS: Record<keyof Snapshot, string> = {
  categoria: "Categoría",
  tipoAveria: "Tipo de Avería",
  estado: "Estado",
  descripcion: "Descripción",
  servicioAfectado: "Servicio Afectado",
  calle: "Calle",
  vecindario: "Vecindario / Barrio",
  responsable: "Responsable Asignado",
  compania: "Compañía Contratista",
};

// ────────────────────────────────────────────────
export default function DetallesReporte() {
  const { user } = useAuth();
  const [imagenes, setImagenes] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Estado de cada campo editable ──────────────
  const [categoria, setCategoria] = useState("");
  const [tipoAveria, setTipoAveria] = useState("");
  const [estado, setEstado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [servicioAfectado, setServicioAfectado] = useState("");
  const [calle, setCalle] = useState("");
  const [vecindario, setVecindario] = useState("");
  const [responsable, setResponsable] = useState("");
  const [compania, setCompania] = useState("");

  // ── Snapshot (último estado guardado) ──────────
  const [snapshot, setSnapshot] = useState<Snapshot>(SNAPSHOT_VACIO);

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
      categoria,
      tipoAveria,
      estado,
      descripcion,
      servicioAfectado,
      calle,
      vecindario,
      responsable,
      compania,
    };

    const ahora = new Date().toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const nuevosLogs: LogEntry[] = (
      Object.keys(current) as (keyof Snapshot)[]
    )
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
      setLogs((prev) => [
        ...prev,
        ...nuevosLogs,
      ]);
      setSnapshot(current);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* ── Header ── */}
      <div className="mb-6">
        <small className="text-[#0040DF] font-bold">Detalles de Reporte</small>
        <h1 className="text-2xl font-bold">Nuevo Reporte de Avería</h1>
      </div>

      {/* ── Grid 2 columnas asimétricas ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "3fr 2fr" }}>
        {/* ══════════ COLUMNA IZQUIERDA ══════════ */}
        <div className="flex flex-col gap-5">
          {/* Card: Información del Reporte */}
          <div className={cardClass}>
            <div className={sectionTitleClass}>
              <Info size={17} color="#0040DF" />
              <span>Información del Reporte</span>
            </div>

            <Field label="Categoría">
              <CustomSelect
                placeholder="Selecciona una categoría"
                options={CATEGORIAS}
                onChange={(v) => {
                  setCategoria(v);
                  setTipoAveria("");
                }}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de Avería">
                <CustomSelect
                  key={categoria}
                  placeholder="Selecciona un tipo"
                  options={tiposAveria}
                  onChange={setTipoAveria}
                />
              </Field>
              <Field label="Estado Inicial">
                <CustomSelect
                  placeholder="Selecciona un estado"
                  options={["En Proceso", "Pendiente", "Asignado", "Completado"]}
                  onChange={setEstado}
                />
              </Field>
            </div>

            <Field label="Descripción Detallada">
              <textarea
                rows={4}
                placeholder="Describa el problema observado con el mayor detalle posible..."
                className={`${inputClass} resize-none`}
                style={readonlyStyle}
                value={descripcion}
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
                <Field label="Servicio Afectado">
                  <CustomSelect
                    placeholder="Selecciona un servicio"
                    options={[
                      "Red Eléctrica Norte",
                      "Red Eléctrica Sur",
                      "Red de Agua Potable",
                      "Aseo Urbano",
                    ]}
                    onChange={setServicioAfectado}
                  />
                </Field>

                <Field label="Calle">
                  <input
                    type="text"
                    placeholder="Av. de la Constitución 45"
                    className={inputClass}
                    style={readonlyStyle}
                    value={calle}
                    onChange={(e) => setCalle(e.target.value)}
                  />
                </Field>

                <Field label="Vecindario / Barrio">
                  <input
                    type="text"
                    placeholder="Centro Histórico"
                    className={inputClass}
                    style={readonlyStyle}
                    value={vecindario}
                    onChange={(e) => setVecindario(e.target.value)}
                  />
                </Field>

                <Field label="Coordenadas GPS">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      readOnly
                      defaultValue="40.4168° N"
                      className={`${inputClass} text-gray-400 cursor-default`}
                      style={readonlyStyle}
                    />
                    <input
                      type="text"
                      readOnly
                      defaultValue="3.7038° W"
                      className={`${inputClass} text-gray-400 cursor-default`}
                      style={readonlyStyle}
                    />
                  </div>
                </Field>
              </div>

              {/* Mapa */}
              <div className="flex flex-col gap-2">
                <div className="h-[260px] rounded-xl overflow-hidden">
                  <Map />
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0040DF] self-end hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <MapPin size={13} />
                  Fijar Ubicación
                </button>
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
                    Admin_Urbis_01
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

              <Field label="Responsable Asignado">
                <CustomSelect
                  placeholder="Selecciona un responsable"
                  options={[
                    "Ing. Roberto Méndez",
                    "Ing. Laura Castillo",
                    "Téc. Pedro Suárez",
                    "Téc. Ana Flores",
                  ]}
                  onChange={setResponsable}
                />
              </Field>

              <Field label="Compañía Contratista">
                <CustomSelect
                  placeholder="Selecciona una compañía"
                  options={[
                    "Construcciones Urbanas S.A.",
                    "ElectroPro C.A.",
                    "AguaServ Ltda.",
                    "AseoCorp S.A.",
                  ]}
                  onChange={setCompania}
                />
              </Field>
            </div>
          </div>

          {/* Card: Evidencia Visual */}
          <div className={cardClass}>
            <div className={sectionTitleClass}>
              <ImageIcon size={17} color="#0040DF" />
              <span>Evidencia Visual</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
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
              text="Guardar Cambios"
              variant_classes="btn-primary w-full h-12 text-base"
              onClick={handleGuardar}
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
            Aún no hay cambios registrados. Modifica campos y guarda para ver el historial.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {[...logs].reverse().map((log, idx, arr) => (
              <div key={log.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
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
