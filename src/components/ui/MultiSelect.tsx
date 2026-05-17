import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface MultiSelectProps {
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: boolean;
}

export default function MultiSelect({
  placeholder,
  options,
  value,
  onChange,
  error = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  }

  const display =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? value.join(", ")
        : `${value[0]}, ${value[1]} +${value.length - 2} más`;

  return (
    <div className="relative">
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition-colors"
        style={{
          backgroundColor: "#F0F4FF",
          color: value.length > 0 ? "#1E293B" : "#94A3B8",
          outline: error ? "2px solid #EF4444" : undefined,
        }}
      >
        <span className="truncate text-left">{display}</span>
        {open ? (
          <ChevronUp size={16} className="shrink-0 ml-2" style={{ color: "#0040DF" }} />
        ) : (
          <ChevronDown size={16} className="shrink-0 ml-2" style={{ color: "#0040DF" }} />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1.5">
          {options.map((opt) => {
            const selected = value.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm text-gray-700 select-none"
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors"
                  style={{
                    borderColor: selected ? "#0040DF" : "#CBD5E1",
                    backgroundColor: selected ? "#0040DF" : "transparent",
                  }}
                >
                  {selected && <Check size={10} color="white" strokeWidth={3} />}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
