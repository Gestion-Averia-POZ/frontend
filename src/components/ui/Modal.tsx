import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: string;
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "btn-primary",
  children,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal box */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <button
            className="btn btn-ghost btn-xs rounded-lg text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {children && <div className="my-4">{children}</div>}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-4">
          <Button text={cancelText} onClick={onClose} variant_classes="btn-outline" />
          {onConfirm && (
            <Button
              text={confirmText}
              onClick={onConfirm}
              variant_classes={confirmVariant}
            />
          )}
        </div>
      </div>
    </div>
  );
}
