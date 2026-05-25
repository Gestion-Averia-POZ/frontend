import Spinner from "./Spinner";

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
}

// Bloque de carga centrado: spinner + mensaje opcional.
// Se usa para reemplazar los "Cargando…" de texto plano en las vistas
// y como fallback de las guardias de ruta (fullPage).
export default function LoadingState({
  message = "Cargando datos…",
  fullPage = false,
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullPage ? "min-h-screen" : "py-16"
      } ${className}`}
    >
      <Spinner size="lg" className="text-primary" />
      {message && <p className="text-sm text-gray-400">{message}</p>}
    </div>
  );
}
