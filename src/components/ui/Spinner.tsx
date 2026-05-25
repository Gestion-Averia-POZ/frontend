interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Spinner reutilizable basado en las clases de carga de DaisyUI.
// Por defecto hereda el color del texto (currentColor), por lo que se ve
// correcto dentro de botones de color. Para bloques de carga usar
// className="text-primary".
export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClass = {
    sm: "loading-sm",
    md: "loading-md",
    lg: "loading-lg",
  }[size];

  return <span className={`loading loading-spinner ${sizeClass} ${className}`} />;
}
