import { type LucideIcon } from "lucide-react";

interface Action<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
}

interface Column<T> {
  key: keyof T;
  header: string;
}

interface ListProps<T extends { id: number | string }> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
}

export default function List<T extends { id: number | string }>({
  columns,
  data,
  actions,
}: ListProps<T>) {
  return (
    <div className="w-full rounded-xl border border-gray-200 overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-3 text-left font-medium text-gray-500">
              id
            </th>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left font-medium text-gray-500"
              >
                {col.header}
              </th>
            ))}
            {actions && actions.length > 0 && <th className="px-6 py-3" />}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 last:border-0">
              <td className="px-6 py-4 text-gray-700">{row.id}</td>
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-6 py-4 text-gray-700"
                >
                  {String(row[col.key])}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => action.onClick(row)}
                        className="btn btn-primary btn-sm"
                      >
                        {action.icon && <action.icon size={14} />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
