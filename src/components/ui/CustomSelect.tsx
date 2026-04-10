import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CustomSelectProps {
  placeholder: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function CustomSelect({
  placeholder,
  options,
  value,
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value ?? "");

  function handleSelect(opt: string) {
    setSelected(opt);
    onChange?.(opt);
    setOpen(false);
  }

  return (
    <div className="relative">
      {/* Backdrop para cerrar al hacer click fuera */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm cursor-pointer transition-colors"
        style={{
          backgroundColor: "#F0F4FF",
          color: selected ? "#1E293B" : "#94A3B8",
        }}
      >
        <span>{selected || placeholder}</span>
        {open ? (
          <ChevronUp size={16} style={{ color: "#0040DF" }} />
        ) : (
          <ChevronDown size={16} style={{ color: "#0040DF" }} />
        )}
      </button>

      {/* Panel de opciones */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1.5">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm text-gray-700 select-none"
            >
              {/* Radio circle */}
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                style={{
                  borderColor: selected === opt ? "#0040DF" : "#CBD5E1",
                }}
              >
                {selected === opt && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#0040DF" }}
                  />
                )}
              </div>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}