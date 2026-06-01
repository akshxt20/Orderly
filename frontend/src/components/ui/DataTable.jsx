import { cn } from "@/utils/cn";

import { SkeletonRow } from "./SkeletonRow";

/**
 * Config-driven table. `columns` is a list of:
 *   { key, header, render?(row), className?, headerClassName? }
 * The page owns the data; this component owns the presentation (loading
 * skeletons, hover/click affordances, empty slot).
 */
export function DataTable({
  columns,
  data = [],
  loading = false,
  skeletonRows = 6,
  rowKey,
  onRowClick,
  emptyState,
}) {
  const showEmpty = !loading && data.length === 0;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/60 text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500",
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading &&
              Array.from({ length: skeletonRows }).map((_, index) => (
                <SkeletonRow key={index} columns={columns.length} />
              ))}

            {!loading &&
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer hover:bg-neutral-50",
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3.5 text-neutral-700", col.className)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showEmpty && emptyState}
    </div>
  );
}
