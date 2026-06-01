import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { useProducts } from "@/hooks/useProducts";
import { PRODUCT_CATEGORIES } from "@/utils/constants";

// scope drives which target field is required — validated with superRefine so the
// error lands on the right field.
const schema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(255),
    discount_percent: z.coerce
      .number({ invalid_type_error: "Enter a discount" })
      .gt(0, "Must be above 0")
      .max(100, "Cannot exceed 100"),
    scope: z.enum(["product", "category"]),
    product_id: z.string().optional(),
    category: z.string().optional(),
    is_active: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.scope === "product" && !value.product_id) {
      ctx.addIssue({ path: ["product_id"], message: "Select a product" });
    }
    if (value.scope === "category" && !value.category) {
      ctx.addIssue({ path: ["category"], message: "Select a category" });
    }
  });

export function SaleForm({ onSubmit, onCancel, submitting }) {
  const { data: productsData } = useProducts({ page: 1, limit: 100 });
  const products = productsData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      discount_percent: "",
      scope: "product",
      product_id: "",
      category: "",
      is_active: true,
    },
  });
  const scope = watch("scope");

  const submit = (values) => {
    const payload = {
      name: values.name,
      discount_percent: values.discount_percent,
      scope: values.scope,
      is_active: values.is_active,
      product_id: values.scope === "product" ? values.product_id : null,
      category: values.scope === "category" ? values.category : null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Field label="Offer name" required error={errors.name?.message}>
        <Input {...register("name")} error={errors.name} placeholder="e.g. Diwali Sale" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Applies to" required error={errors.scope?.message}>
          <Select {...register("scope")} error={errors.scope}>
            <option value="product">A specific product</option>
            <option value="category">A whole category</option>
          </Select>
        </Field>
        <Field label="Discount %" required error={errors.discount_percent?.message}>
          <Input type="number" step="0.01" min="0" max="100" {...register("discount_percent")} error={errors.discount_percent} />
        </Field>
      </div>

      {scope === "product" ? (
        <Field label="Product" required error={errors.product_id?.message}>
          <Select {...register("product_id")} error={errors.product_id}>
            <option value="">Select product…</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <Field label="Category" required error={errors.category?.message}>
          <Select {...register("category")} error={errors.category}>
            <option value="">Select category…</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" {...register("is_active")} className="h-4 w-4 rounded border-neutral-300" />
        Active immediately
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Create sale
        </Button>
      </div>
    </form>
  );
}
