import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  visible: boolean;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ─────────────────────────────────────────────
// CONTEXTO
// ─────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | null>(null);

const AUTO_DISMISS_MS = 3500;
const EXIT_ANIM_MS = 200;

// ─────────────────────────────────────────────
// CONFIG VISUAL POR TIPO
// ─────────────────────────────────────────────

const TYPE_CONFIG: Record<
  ToastType,
  { icon: typeof CheckCircle2; border: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    border: "border-l-4 border-green-500",
    iconColor: "text-green-500",
  },
  error: {
    icon: AlertCircle,
    border: "border-l-4 border-red-500",
    iconColor: "text-red-500",
  },
  info: {
    icon: Info,
    border: "border-l-4 border-blue-500",
    iconColor: "text-blue-500",
  },
};

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    // Inicia la animación de salida y elimina tras completarse.
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_ANIM_MS);
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, message, visible: false }]);
      // Activa la animación de entrada en el siguiente frame.
      requestAnimationFrame(() =>
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: true } : t)),
        ),
      );
      setTimeout(() => remove(id), AUTO_DISMISS_MS);
    },
    [remove],
  );

  const api: ToastContextType = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Contenedor de toasts — esquina superior derecha, por encima de modales (z-[200]) */}
      <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const cfg = TYPE_CONFIG[t.type];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 w-80 max-w-[90vw] rounded-xl bg-white px-4 py-3 shadow-lg ${cfg.border}`}
              style={{
                opacity: t.visible ? 1 : 0,
                transform: t.visible ? "translateX(0)" : "translateX(120%)",
                transition: `opacity ${EXIT_ANIM_MS}ms ease, transform ${EXIT_ANIM_MS}ms ease`,
              }}
            >
              <Icon size={20} className={`${cfg.iconColor} shrink-0 mt-0.5`} />
              <p className="flex-1 text-sm text-gray-700">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600"
                aria-label="Cerrar notificación"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOK — useToast
// ─────────────────────────────────────────────

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
