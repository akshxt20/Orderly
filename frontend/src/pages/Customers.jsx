import { useState } from "react";

import { CustomerForm } from "@/components/customers/CustomerForm";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer,
} from "@/hooks/useCustomers";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/utils/date";
import { getInitialColor, getInitial } from "@/utils/getInitialColor";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 10;

export default function Customers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [view, setView] = useState("grid"); // "grid" | "table"

  const debouncedSearch = useDebounce(search);
  const params = { page, limit: PAGE_SIZE, sort_by: "created_at", sort_dir: "desc" };
  if (debouncedSearch) params.search = debouncedSearch;

  const { data, isLoading } = useCustomers(params);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSubmit = (payload) => {
    if (editing === "new") {
      createCustomer.mutate(payload, { onSuccess: () => setEditing(null) });
    } else {
      updateCustomer.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) });
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <span className="flex items-center gap-3 font-medium text-neutral-900">
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-inner select-none", getInitialColor(c.name).bg, getInitialColor(c.name).text)}>
            {getInitial(c.name)}
          </span>
          {c.name}
        </span>
      ),
    },
    { key: "email", header: "Email", render: (c) => c.email },
    { key: "phone", header: "Phone", render: (c) => c.phone || "—" },
    { key: "created_at", header: "Joined", render: (c) => formatDate(c.created_at) },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditing(c)} title="Edit">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setDeleteTarget(c)}
            title="Delete"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  const emptyState = (
    <EmptyState
      title={debouncedSearch ? "No matching customers" : "No customers yet"}
      description={
        debouncedSearch ? "Try a different search term." : "Add your first customer to get started."
      }
      action={!debouncedSearch && <Button onClick={() => setEditing("new")}>+ Add customer</Button>}
    />
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        description="People who place orders with you."
        action={<Button onClick={() => setEditing("new")}>+ Add customer</Button>}
      />

      <div className="mb-4 flex gap-3 items-center justify-between">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search by name or email…"
          className="sm:max-w-xs flex-1"
        />

        {/* Desktop view switcher */}
        <div className="hidden sm:flex rounded-lg border border-neutral-300 bg-white p-0.5 shrink-0 ml-4">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5",
              view === "grid" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
            )}
            title="Grid View"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Grid
          </button>
          <button
            onClick={() => setView("table")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5",
              view === "table" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
            )}
            title="Table List View"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            List
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="skeleton h-12 w-12 rounded-full shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-2/3 animate-pulse" />
                    <div className="skeleton h-3 w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white">{emptyState}</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={setEditing}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          loading={isLoading}
          rowKey={(c) => c.id}
          emptyState={emptyState}
        />
      )}

      {meta && (
        <div className="overflow-hidden rounded-b-xl border border-t-0 border-neutral-200 bg-white">
          <Pagination page={meta.page} totalPages={meta.total_pages} total={meta.total} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add customer" : "Edit customer"}
      >
        <CustomerForm
          mode={editing === "new" ? "create" : "edit"}
          defaultValues={
            editing && editing !== "new"
              ? {
                  name: editing.name,
                  email: editing.email,
                  phone: editing.phone ?? "",
                  address: editing.address ?? "",
                }
              : undefined
          }
          submitting={createCustomer.isPending || updateCustomer.isPending}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteCustomer.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
        title="Delete customer"
        message={`Delete "${deleteTarget?.name}"? Customers with existing orders can't be removed.`}
        loading={deleteCustomer.isPending}
      />
    </div>
  );
}

/** Local helper card component for customer cards */
function CustomerCard({ customer, onEdit, onDelete }) {
  const { bg, text } = getInitialColor(customer.name);
  const initial = getInitial(customer.name);

  return (
    <div className="group relative flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md min-w-0">
      {/* Circle Avatar */}
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold select-none text-lg shadow-inner ${bg} ${text}`}>
        {initial}
      </div>

      {/* Details Container with total protection against overflow */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-neutral-900 truncate" title={customer.name}>
          {customer.name}
        </h3>
        <p className="text-xs text-neutral-500 truncate mt-0.5" title={customer.email}>
          {customer.email}
        </p>
        <p className="text-xs text-neutral-400 truncate mt-0.5" title={customer.phone}>
          {customer.phone || "No phone number"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex shrink-0 gap-1 self-start">
        <Button
          size="sm"
          variant="ghost"
          className="p-1.5 h-8 w-8 rounded-lg text-neutral-500 hover:text-neutral-900"
          onClick={() => onEdit(customer)}
          title="Edit"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="p-1.5 h-8 w-8 rounded-lg text-red-600 hover:bg-red-50"
          onClick={() => onDelete(customer)}
          title="Delete"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
