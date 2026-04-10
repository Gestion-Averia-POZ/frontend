import { useRef, useState } from "react";
import {
  Info,
  Settings2,
  MapPin,
  Users,
  ImageIcon,
  Camera,
  CalendarDays,
  UserCircle2,
} from "lucide-react";
import { Map } from "../components/layout";
import { Button } from "../components/ui";
import CustomSelect from "../components/ui/CustomSelect";

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

// ────────────────────────────────────────────────
export default function DetallesReporte() {
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [categoria, setCategoria] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tiposAveria = categoria
    ? [...(TIPOS_POR_CATEGORIA[categoria] ?? []), "Otro"]
    : ["Otro"];

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setImagenes((prev) => [...prev, ...Array.from(e.target.files!)]);
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
                onChange={setCategoria}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de Avería">
                <CustomSelect
                  key={categoria}
                  placeholder="Selecciona un tipo"
                  options={tiposAveria}
                />
              </Field>
              <Field label="Estado Inicial">
                <CustomSelect
                  placeholder="Selecciona un estado"
                  options={[
                    "En Proceso",
                    "Pendiente",
                    "Asignado",
                    "Completado",
                  ]}
                />
              </Field>
            </div>

            <Field label="Descripción Detallada">
              <textarea
                rows={4}
                placeholder="Describa el problema observado con el mayor detalle posible..."
                className={`${inputClass} resize-none`}
                style={readonlyStyle}
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
                  />
                </Field>

                <Field label="Calle">
                  <input
                    type="text"
                    placeholder="Av. de la Constitución 45"
                    className={inputClass}
                    style={readonlyStyle}
                  />
                </Field>

                <Field label="Vecindario / Barrio">
                  <input
                    type="text"
                    placeholder="Centro Histórico"
                    className={inputClass}
                    style={readonlyStyle}
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
              {/* Botón de subir */}
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

              {/* Previews de imágenes subidas */}
              {imagenes.map((file, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(file)}
                  alt={`evidencia-${i}`}
                  className="h-28 w-full rounded-xl object-cover"
                />
              ))}
            </div>

            {/* Input file oculto */}
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

          {/* Botón submit */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              text="Crear Reporte"
              variant_classes="btn-primary w-full h-12 text-base"
            />
            <Button
              text="Cancelar"
              variant_classes="bg-[#e21313] text-[white] w-full h-12 text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
