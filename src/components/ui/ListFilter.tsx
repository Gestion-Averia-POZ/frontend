import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

export interface FilterConfig<T> {
  field: keyof T;
  label: string;
  type: "checkbox" | "text";
}

export interface FilterState {
  checkbox: Record<string, string[]>;
  text: Record<string, string>;
}

interface Props<T extends object> {
  filters: FilterConfig<T>[];
  data: T[];
  onChange: (state: FilterState) => void;
}

export default function ListFilter<T extends object>({
  filters,
  data,
  onChange,
}: Props<T>) {
  const [checkbox, setCheckbox] = useState<Record<string, string[]>>({});
  const [text, setText] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const checkboxFilters = filters.filter((f) => f.type === "checkbox");
  const textFilters = filters.filter((f) => f.type === "text");

  function getUniqueValues(field: keyof T): string[] {
    return [...new Set(data.map((row) => String(row[field])))].sort();
  }

  function toggleCheckbox(field: string, value: string) {
    const current = checkbox[field] ?? [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const next = { ...checkbox };
    if (updated.length === 0) delete next[field];
    else next[field] = updated;
    setCheckbox(next);
    onChange({ checkbox: next, text });
  }

  function updateText(field: string, value: string) {
    const next = { ...text };
    if (!value) delete next[field];
    else next[field] = value;
    setText(next);
    onChange({ checkbox, text: next });
  }

  function clearAll() {
    setCheckbox({});
    setText({});
    onChange({ checkbox: {}, text: {} });
  }

  function getLabelForField(field: string) {
    return filters.find((f) => String(f.field) === field)?.label ?? field;
  }

  const checkboxChips = Object.entries(checkbox).flatMap(([field, values]) =>
    values.map((v) => ({
      type: "checkbox" as const,
      field,
      value: v,
      display: `${getLabelForField(field)}: ${v}`,
    }))
  );

  const textChips = Object.entries(text).map(([field, value]) => ({
    type: "text" as const,
    field,
    value,
    display: `${getLabelForField(field)}: "${value}"`,
  }));

  const chips = [...checkboxChips, ...textChips];

  return (
    <div className="flex flex-col gap-2">
      {/* Backdrop para cerrar dropdown al hacer click fuera */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {/* Dropdowns con checkboxes */}
        {checkboxFilters.map((filter) => {
          const key = String(filter.field);
          const selected = checkbox[key] ?? [];
          const isOpen = openDropdown === key;
          const options = getUniqueValues(filter.field);

          return (
            <div key={key} className="relative z-50">
              <button
                onClick={() => setOpenDropdown(isOpen ? null : key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {filter.label}
                {selected.length > 0 && (
                  <span className="bg-[#0040DF] text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {selected.length}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  style={{
                    transition: "transform 0.2s",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[180px] p-1.5">
                  {options.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm text-gray-700 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(opt)}
                        onChange={() => toggleCheckbox(key, opt)}
                        className="checkbox checkbox-xs checkbox-primary"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Inputs de texto */}
        {textFilters.map((filter) => {
          const key = String(filter.field);
          return (
            <input
              key={key}
              type="text"
              placeholder={filter.label}
              value={text[key] ?? ""}
              onChange={(e) => updateText(key, e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 w-44 transition-all"
            />
          );
        })}
      </div>

      {/* Chips de filtros activos */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {chips.map((chip, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#0040DF] text-xs rounded-full font-medium"
            >
              {chip.display}
              <button
                onClick={() =>
                  chip.type === "checkbox"
                    ? toggleCheckbox(chip.field, chip.value)
                    : updateText(chip.field, "")
                }
                className="hover:text-blue-900 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer px-1"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}
