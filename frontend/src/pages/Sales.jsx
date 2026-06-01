import { useState } from "react";

import { SaleForm } from "@/components/sales/SaleForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useCreateSale, useDeleteSale, useSales, useUpdateSale } from "@/hooks/useSales";

const PAGE_SIZE = 10;

export default function Sales() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useSales({ page, limit: PAGE_SIZE, sort_by: "created_at", sort_dir: "desc" });
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();

  const sales = data?.data ?? [];
  const meta = data?.meta;

  const columns = [
    {
      key: "name",
      header: "Offer",
      render: (s) => <span className="font-medium text-neutral-900">{s.name}</span>,
    },
    {
      key: "scope",
      header: "Applies to",
      render: (s) =>
        s.scope === "product" ? (
          <span className="flex items-center gap-2">
            <Badge variant="info">Product</Badge>
            {s.product?.name ?? "—"}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Badge variant="neutral">Category</Badge>
            {s.category}
          </span>
        ),
    },
    {
      key: "discount_percent",
      header: "Discount",
      render: (s) => <span className="font-medium">{Number(s.discount_percent)}% off</span>,
    },
    {
      key: "is_active",
      header: "Status",
      render: (s) => (
        <Badge variant={s.is_active ? "success" : "neutral"}>
          {s.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              updateSale.mutate({ id: s.id, payload: { is_active: !s.is_active } })
            }
          >
            {s.is_active ? "Pause" : "Activate"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setDeleteTarget(s)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Sales & Offers"
        description="Run discounts on a single product or a whole category."
        action={<Button onClick={() => setCreating(true)}>+ New sale</Button>}
      />

      <DataTable
        columns={columns}
        data={sales}
        loading={isLoading}
        rowKey={(s) => s.id}
        emptyState={
          <EmptyState
            title="No sales yet"
            description="Create an offer to start discounting products."
            action={<Button onClick={() => setCreating(true)}>+ New sale</Button>}
          />
        }
      />

      {meta && (
        <div className="overflow-hidden rounded-b-xl border border-t-0 border-neutral-200 bg-white">
          <Pagination page={meta.page} totalPages={meta.total_pages} total={meta.total} onPageChange={setPage} />
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New sale">
        <SaleForm
          submitting={createSale.isPending}
          onSubmit={(payload) => createSale.mutate(payload, { onSuccess: () => setCreating(false) })}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteSale.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        title="Delete sale"
        message={`Remove the "${deleteTarget?.name}" offer? Prices will revert immediately.`}
        loading={deleteSale.isPending}
      />
    </div>
  );
}
