import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/useCategories";

export function CategoryManager() {
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState("");

  const list = categories ?? [];

  const add = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createCategory.mutate(trimmed, { onSuccess: () => setName("") });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New category name"
        />
        <Button type="submit" loading={createCategory.isPending}>
          Add
        </Button>
      </form>

      <ul className="divide-y divide-neutral-100 overflow-hidden rounded-lg border border-neutral-200">
        {list.length === 0 && (
          <li className="px-3 py-3 text-sm text-neutral-400">No categories yet.</li>
        )}
        {list.map((category) => (
          <li key={category} className="flex items-center justify-between px-3 py-2.5">
            <span className="text-sm text-neutral-800">{category}</span>
            <button
              type="button"
              onClick={() => deleteCategory.mutate(category)}
              disabled={deleteCategory.isPending}
              className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              title="Delete category"
              aria-label={`Delete ${category}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-neutral-400">
        A category that's in use by products can't be deleted.
      </p>
    </div>
  );
}
