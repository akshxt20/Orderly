import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { OrderForm } from "@/components/orders/OrderForm";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Field";
import { useCreateOrder, useDeleteOrder, useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { getInitialColor, getInitial } from "@/utils/getInitialColor";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 10;

const STATUS_COLORS = {
  ordered: "bg-blue-500 border-blue-500 text-blue-700 bg-blue-50/50",
  dispatched: "bg-indigo-500 border-indigo-500 text-indigo-700 bg-indigo-50/50",
  shipped: "bg-purple-500 border-purple-500 text-purple-700 bg-purple-50/50",
  arriving: "bg-amber-500 border-amber-500 text-amber-700 bg-amber-50/50",
  arrived: "bg-emerald-500 border-emerald-500 text-emerald-700 bg-emerald-50/50",
};

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState("desc");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [view, setView] = useState("cards"); // "cards" | "table"

  // Automatically open order form if triggered from quick order navigation
  useEffect(() => {
    if (location.state?.createOrderOpen) {
      setCreating(true);
      // Clean up state so refreshing won't trigger it again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const params = { page, limit: PAGE_SIZE, sort_by: "created_at", sort_dir: sortDir };
  const { data, isLoading } = useOrders(params);
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const columns = [
    {
      key: "id",
      header: "Order",
      render: (o) => <span className="font-mono text-xs text-neutral-500">#{o.id.slice(0, 8).toUpperCase()}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <span className="flex items-center gap-2 font-medium text-neutral-900">
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-inner select-none", getInitialColor(o.customer.name).bg, getInitialColor(o.customer.name).text)}>
            {getInitial(o.customer.name)}
          </span>
          {o.customer.name}
        </span>
      ),
    },
    {
      key: "item_count",
      header: "Items",
      render: (o) => `${o.item_count} item${o.item_count === 1 ? "" : "s"}`,
    },
    { key: "total_amount", header: "Total", render: (o) => formatCurrency(o.total_amount) },
    { key: "status", header: "Status", render: (o) => <OrderStatusBadge status={o.status} /> },
    { key: "created_at", header: "Date", render: (o) => formatDate(o.created_at) },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (o) => (
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:bg-red-50"
          onClick={(event) => {
            event.stopPropagation(); // don't trigger row navigation
            setDeleteTarget(o);
          }}
          title="Delete"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Orders"
        description="Track and fulfil customer orders."
        action={<Button onClick={() => setCreating(true)}>+ New order</Button>}
      />

      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <Select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className="sm:w-48 flex-1 sm:flex-none">
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </Select>

        {/* View switcher on desktop */}
        <div className="hidden sm:flex rounded-lg border border-neutral-300 bg-white p-0.5 shrink-0 ml-auto">
          <button
            onClick={() => setView("cards")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5",
              view === "cards" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
            )}
            title="Card Feed View"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            Feed
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
            Table
          </button>
        </div>
      </div>

      {view === "cards" ? (
        <>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 border border-neutral-200 bg-white rounded-2xl p-5 pl-7 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-neutral-200 animate-pulse" />
                  <div className="flex-1 space-y-2 w-full">
                    <div className="skeleton h-5 w-1/3 animate-pulse" />
                    <div className="skeleton h-4 w-1/4 animate-pulse" />
                  </div>
                  <div className="skeleton h-8 w-24 shrink-0 animate-pulse mt-3 sm:mt-0" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white">
              <EmptyState
                title="No orders yet"
                description="Place your first order to get started."
                action={<Button onClick={() => setCreating(true)}>+ New order</Button>}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={(o) => navigate(`/orders/${o.id}`)}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          rowKey={(o) => o.id}
          onRowClick={(o) => navigate(`/orders/${o.id}`)}
          emptyState={
            <EmptyState
              title="No orders yet"
              description="Place your first order to get started."
              action={<Button onClick={() => setCreating(true)}>+ New order</Button>}
            />
          }
        />
      )}

      {meta && (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <Pagination page={meta.page} totalPages={meta.total_pages} total={meta.total} onPageChange={setPage} />
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New order" size="lg">
        <OrderForm
          initialProductId={location.state?.preselectedProductId}
          submitting={createOrder.isPending}
          onSubmit={(payload) =>
            createOrder.mutate(payload, { onSuccess: () => setCreating(false) })
          }
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteOrder.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
        title="Delete order"
        message="Deleting this order will restore the stock it reserved. Continue?"
        loading={deleteOrder.isPending}
      />
    </div>
  );
}

/** Local detailed custom Order Card component */
function OrderCard({ order, onDelete, onClick }) {
  const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.ordered;

  const handleClick = (e) => {
    if (e.target.closest("button")) return;
    onClick(order);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 pl-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    >
      {/* Thick Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${statusColor.split(" ")[0]}`} />

      {/* Main Details */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-sm font-semibold text-neutral-800">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <OrderStatusBadge status={order.status} />
          <span className="text-xs text-neutral-400">
            {formatDate(order.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Customer Avatar indicator */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-inner select-none",
              getInitialColor(order.customer.name).bg,
              getInitialColor(order.customer.name).text
            )}>
              {getInitial(order.customer.name)}
            </span>
            <span className="font-medium text-sm text-neutral-900 truncate">
              {order.customer.name}
            </span>
          </div>
          <span className="text-neutral-300">•</span>
          <span className="text-xs text-neutral-500">
            {order.item_count} item{order.item_count === 1 ? "" : "s"}
          </span>
        </div>
        
        {order.notes && (
          <p className="text-xs text-neutral-400 italic truncate max-w-lg mt-1">
            "{order.notes}"
          </p>
        )}
      </div>

      {/* Right side Pricing & Navigation Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-neutral-100 pt-3 sm:border-t-0 sm:pt-0 shrink-0">
        <div className="text-left sm:text-right">
          <span className="block text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Total Amount</span>
          <span className="text-lg font-bold text-neutral-950 font-mono">
            {formatCurrency(order.total_amount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50 p-2 h-9 w-9 rounded-xl transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(order);
            }}
            title="Delete Order"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>

          <span className="text-neutral-300 hidden sm:block">|</span>

          <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-400 group-hover:text-neutral-800 transition-colors transform group-hover:translate-x-0.5 duration-200 hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
