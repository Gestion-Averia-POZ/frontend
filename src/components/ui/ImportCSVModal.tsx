import { useEffect, useRef, useState } from "react";
import { X, Download, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import Button from "./Button";
import { authService, type CSVImportResult } from "../../services/auth.service";
import { reportsService } from "../../services/reports.service";

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "users" | "reports";
  onSuccess?: () => void;
}

export default function ImportCSVModal({ isOpen, onClose, type, onSuccess }: ImportCSVModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
      const t = setTimeout(() => {
        setMounted(false);
        setFile(null);
        setResult(null);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const title = type === "users" ? "Importar Usuarios" : "Importar Reportes";
  const description =
    type === "users"
      ? "Importa múltiples usuarios (CITIZEN o WORKER) desde un archivo CSV."
      : "Importa múltiples reportes de averías desde un archivo CSV.";

  async function handleDownloadTemplate() {
    setDownloading(true);
    try {
      if (type === "users") {
        await authService.downloadUsersCSVTemplate();
      } else {
        await reportsService.downloadReportsCSVTemplate();
      }
    } catch (err) {
      console.error("Error al descargar plantilla:", err);
    } finally {
      setDownloading(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const res =
        type === "users"
          ? await authService.importUsersCSV(file)
          : await reportsService.importReportsCSV(file);
      setResult(res);
      if (res.success && res.created > 0) {
        successTimerRef.current = setTimeout(() => {
          onSuccess?.();
        }, 2500);
      }
    } catch (err) {
      setResult({
        success: false,
        total: 0,
        created: 0,
        failed: 1,
        errors: [{ row: 0, error: err instanceof Error ? err.message : "Error al importar" }],
      });
    } finally {
      setImporting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    // Reset input so same file can be re-selected after clearing
    e.target.value = "";
  }

  if (!mounted) return null;

  const isSuccess = result?.success && (result.created ?? 0) > 0;
  const hasRowErrors = result && result.total > 0 && result.errors.length > 0;
  const isSingleError = result && result.total === 0 && result.errors.length === 1 && result.errors[0].row === 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal box */}
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl mx-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <button
            className="btn btn-ghost btn-xs rounded-lg text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Template download */}
        <div className="bg-[#F0F4FF] border border-blue-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">Plantilla CSV</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Descarga la plantilla con los campos requeridos y ejemplos.
              </p>
            </div>
            <Button
              text={downloading ? "Descargando..." : "Descargar"}
              icon={Download}
              variant_classes="btn-outline btn-sm"
              onClick={handleDownloadTemplate}
              disabled={downloading}
            />
          </div>
        </div>

        {/* File upload zone */}
        <div className="mb-4">
          <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
            Archivo CSV
          </label>
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Upload size={24} className="mx-auto mb-2 text-gray-400" />
            {file ? (
              <div>
                <p className="text-sm font-semibold text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB · Haz clic para cambiar archivo
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">Haz clic para seleccionar un archivo CSV</p>
                <p className="text-xs text-gray-400 mt-0.5">Máximo 5 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-xl p-4 mb-4 ${
              isSuccess
                ? "bg-green-50 border border-green-100"
                : "bg-red-50 border border-red-100"
            }`}
          >
            <div className="flex items-start gap-2">
              {isSuccess ? (
                <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    isSuccess ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {isSuccess
                    ? `Se importaron ${result.created} de ${result.total} registros exitosamente`
                    : isSingleError
                    ? result.errors[0].error
                    : `${result.failed} de ${result.total} registro(s) con errores — no se importó nada`}
                </p>
                {hasRowErrors && !isSingleError && (
                  <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                    {result.errors.map((err, i) => (
                      <div
                        key={i}
                        className="text-xs text-red-600 bg-white rounded px-2 py-1 border border-red-100"
                      >
                        {err.row > 0 && (
                          <span className="font-semibold">Fila {err.row}: </span>
                        )}
                        {err.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button text="Cerrar" onClick={onClose} variant_classes="btn-outline" />
          {!isSuccess && (
            <Button
              text={importing ? "Importando..." : "Importar"}
              icon={Upload}
              onClick={handleImport}
              variant_classes="btn-primary"
              disabled={!file || importing}
            />
          )}
        </div>
      </div>
    </div>
  );
}
