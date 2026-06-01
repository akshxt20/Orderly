import { Button } from "./Button";

export function Pagination({ page, totalPages, total, onPageChange }) {
  if (!total) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm">
      <span className="text-neutral-500">
        Page {page} of {Math.max(totalPages, 1)} · {total} total
      </span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
