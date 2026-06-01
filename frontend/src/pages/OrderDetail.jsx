import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ORDER_STEPS, StatusStepper } from "@/components/orders/StatusStepper";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDeleteOrder, useOrder, useUpdateOrderStatus } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data: order, isLoading, isError } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  if (isLoading) return <OrderDetailSkeleton />;

  if (isError || !order) {
    return (
      <div className="animate-fade-in">
        <BackLink />
        <div className="rounded-xl border border-neutral-200 bg-white">
          <EmptyState
            title="Order not found"
            description="It may have been deleted."
            action={<Button onClick={() => navigate("/orders")}>Back to orders</Button>}
          />
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.indexOf(order.status);
  const nextStatus = ORDER_STEPS[currentIndex + 1];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <BackLink />
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Order <span className="font-mono text-xl text-neutral-500">#{order.id.slice(0, 8)}</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {nextStatus && (
            <Button
              loading={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
            >
              Mark as {nextStatus}
            </Button>
          )}
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Status pipeline */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <StatusStepper status={order.status} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line items */}
        <section className="rounded-xl border border-neutral-200 bg-white lg:col-span-2">
          <header className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-neutral-900">Items</h2>
          </header>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Unit price</th>
                <th className="px-5 py-3 font-semibold">Qty</th>
                <th className="px-5 py-3 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-neutral-900">{item.product.name}</p>
                    <p className="font-mono text-xs text-neutral-400">{item.product.sku}</p>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-700">{formatCurrency(item.unit_price)}</td>
                  <td className="px-5 py-3.5 text-neutral-700">{item.quantity}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-neutral-900">
                    {formatCurrency(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200">
                <td colSpan={3} className="px-5 py-4 text-right text-sm font-medium text-neutral-600">
                  Total
                </td>
                <td className="px-5 py-4 text-right text-lg font-semibold text-neutral-900">
                  {formatCurrency(order.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
          </div>
        </section>

        {/* Customer + notes */}
        <section className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-900">Customer</h2>
            <p className="mt-3 font-medium text-neutral-900">{order.customer.name}</p>
            <p className="text-sm text-neutral-500">{order.customer.email}</p>
          </div>
          {order.notes && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-900">Notes</h2>
              <p className="mt-2 text-sm text-neutral-600">{order.notes}</p>
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={() =>
          deleteOrder.mutate(order.id, { onSuccess: () => navigate("/orders") })
        }
        title="Delete order"
        message="Deleting this order will restore the stock it reserved. Continue?"
        loading={deleteOrder.isPending}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/orders"
      className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
      Orders
    </Link>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-24 w-full rounded-xl" />
      <div className="skeleton h-64 w-full rounded-xl" />
    </div>
  );
}
