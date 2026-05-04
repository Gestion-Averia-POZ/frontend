import { useState } from "react";
import { type LucideIcon } from "lucide-react";
import Pagination from "./Pagination";
import ListFilter, { type FilterConfig, type FilterState } from "./ListFilter";

export type { FilterConfig } from "./ListFilter";

interface Action<T> {
  label: string | ((row: T) => string);
  icon?: LucideIcon;
  onClick: (row: T) => void;
  className?: string;
}

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface ListProps<T extends { id: number | string }> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  itemsPerPage?: number;
  filters?: FilterConfig<T>[];
  initialFilterState?: FilterState;
  filterActions?: React.ReactNode;
  onFilterChange?: (state: FilterState) => void;
}

export default function List<T extends { id: number | string }>({
  columns,
  data,
  actions,
  itemsPerPage = 10,
  filters,
  initialFilterState,
  filterActions,
  onFilterChange,
}: ListProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterState, setFilterState] = useState<FilterState>(
    initialFilterState ?? { checkbox: {}, text: {} },
  );

  const filteredData = data.filter((row) => {
    for (const [field, values] of Object.entries(filterState.checkbox)) {
      if (
        values.length > 0 &&
        !values.includes(String(row[field as keyof T]))
      ) {
        return false;
      }
    }
    for (const [field, value] of Object.entries(filterState.text)) {
      if (
        value &&
        !String(row[field as keyof T])
          .toLowerCase()
          .includes(value.toLowerCase())
      ) {
        return false;
      }
    }
    return true;
  });

  function handleFilterChange(state: FilterState) {
    setFilterState(state);
    setCurrentPage(1);
    onFilterChange?.(state);
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = filteredData.slice(start, start + itemsPerPage);

  const thClass =
    "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400";

  return (
    <div className="flex flex-col gap-4">
      {((filters && filters.length > 0) || filterActions) && (
        <div className="flex items-start  gap-3">
          {filters && filters.length > 0 && (
            <ListFilter
              filters={filters}
              data={data}
              onChange={handleFilterChange}
              initialCheckbox={initialFilterState?.checkbox}
            />
          )}
          {filterActions && (
            <div className="flex-shrink-0">{filterActions}</div>
          )}
        </div>
      )}

      <div className="w-full rounded-xl border border-gray-200 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {columns.map((col) => (
                <th key={String(col.key)} className={thClass}>
                  {col.header}
                </th>
              ))}
              {actions && actions.length > 0 && <th className={thClass} />}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  Sin resultados
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-6 py-4 text-gray-700"
                    >
                      {col.render ? col.render(row) : String(row[col.key])}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => action.onClick(row)}
                            className={
                              action.className ?? "btn btn-primary btn-sm"
                            }
                          >
                            {action.icon && <action.icon size={14} />}
                            {typeof action.label === "function" ? action.label(row) : action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
