import React from "react";
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
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
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
        <div className="my-4">{children}</div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button
            text={cancelText}
            onClick={onClose}
            variant_classes="btn-outline"
          />
          {onConfirm && (
            <Button
              text={confirmText}
              onClick={onConfirm}
              variant_classes="btn-primary"
            />
          )}
        </div>
      </div>
    </div>
  );
}