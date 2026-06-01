import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { formatCurrency } from "@/utils/currency";

const schema = z.object({
  customer_id: z.string().min(1, "Select a customer"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1, "Select a product"),
        quantity: z.coerce.number().int("Whole numbers only").min(1, "Min 1"),
      }),
    )
    .min(1, "Add at least one product"),
});

export function OrderForm({ initialProductId = "", onSubmit, onCancel, submitting }) {
  // Pull enough rows to populate the dropdowns without paginating inside a form.
  const { data: customersData } = useCustomers({ page: 1, limit: 100 });
  const { data: productsData } = useProducts({ page: 1, limit: 100 });
  const customers = customersData?.data ?? [];
  const products = productsData?.data ?? [];
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: "",
      notes: "",
      items: [{ product_id: initialProductId || "", quantity: 1 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Live total preview using the effective (post-discount) price; the backend
  // recomputes the authoritative figure on submit.
  const watchedItems = watch("items");
  const priceOf = (product) => Number(product.effective_price ?? product.price);
  const previewTotal = watchedItems.reduce((sum, item) => {
    const product = productById[item.product_id];
    const quantity = Number(item.quantity) || 0;
    return sum + (product ? priceOf(product) * quantity : 0);
  }, 0);

  const submit = (values) => {
    onSubmit({
      customer_id: values.customer_id,
      notes: values.notes?.trim() || null,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Field label="Customer" required error={errors.customer_id?.message}>
        <Select {...register("customer_id")} error={errors.customer_id}>
          <option value="">Select a customer…</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} — {customer.email}
            </option>
          ))}
        </Select>
      </Field>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">
            Items <span className="text-red-500">*</span>
          </span>
          <Button size="sm" variant="secondary" onClick={() => append({ product_id: "", quantity: 1 })}>
            + Add item
          </Button>
        </div>
        {errors.items?.message && <p className="mb-2 text-xs text-red-600">{errors.items.message}</p>}

        <div className="space-y-2">
          {fields.map((field, index) => {
            const selected = productById[watchedItems[index]?.product_id];
            const quantity = Number(watchedItems[index]?.quantity) || 0;
            const overStock = selected && quantity > selected.quantity;

            return (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Select
                    {...register(`items.${index}.product_id`)}
                    error={errors.items?.[index]?.product_id}
                  >
                    <option value="">Select product…</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.quantity} in stock)
                      </option>
                    ))}
                  </Select>
                  {errors.items?.[index]?.product_id && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.items[index].product_id.message}
                    </p>
                  )}
                  {overStock && (
                    <p className="mt-1 text-xs text-amber-600">
                      Only {selected.quantity} in stock
                    </p>
                  )}
                </div>

                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`)}
                    error={errors.items?.[index]?.quantity || overStock}
                  />
                </div>

                <div className="w-28 pt-2.5 text-right text-sm text-neutral-600">
                  {selected ? formatCurrency(priceOf(selected) * quantity) : "—"}
                </div>

                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length <= 1}
                  aria-label="Remove item"
                  className="pt-2.5 text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-30"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <Field label="Notes">
        <Textarea {...register("notes")} placeholder="Optional notes…" />
      </Field>

      <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-600">Order total</span>
        <span className="text-lg font-semibold text-neutral-900">{formatCurrency(previewTotal)}</span>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Place order
        </Button>
      </div>
    </form>
  );
}
