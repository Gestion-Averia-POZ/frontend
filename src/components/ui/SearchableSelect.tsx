import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SearchableSelectProps {
  placeholder: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function SearchableSelect({
  placeholder,
  options,
  value = "",
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  function openDropdown() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      )
        setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function handleSelect(opt: string) {
    setQuery(opt);
    onChange?.(opt);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm cursor-text"
        style={{ backgroundColor: "#F0F4FF" }}
        onClick={openDropdown}
      >
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
            if (!open) openDropdown();
          }}
          className="bg-transparent outline-none w-full text-gray-700 placeholder:text-gray-400"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); open ? setOpen(false) : openDropdown(); }}
          className="shrink-0 cursor-pointer"
        >
          {open
            ? <ChevronUp size={16} style={{ color: "#0040DF" }} />
            : <ChevronDown size={16} style={{ color: "#0040DF" }} />
          }
        </button>
      </div>

      {open && filtered.length > 0 && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 max-h-48 overflow-y-auto"
        >
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(opt)}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm text-gray-700 select-none"
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                style={{ borderColor: query === opt ? "#0040DF" : "#CBD5E1" }}
              >
                {query === opt && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0040DF" }} />
                )}
              </div>
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
