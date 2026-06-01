import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { PRODUCT_CATEGORIES } from "@/utils/constants";
import { useCategories } from "@/hooks/useCategories";

// Client-side mirror of the backend's rules
const schema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(100),
  name: z.string().trim().min(1, "Name is required").max(255),
  category: z.string().min(1, "Category is required").max(50),
  customCategory: z.string().trim().max(50).optional(),
  // Any string is accepted — a broken/invalid link simply falls back to the
  // product's coloured initial at display time, so no validation error here.
  image_url: z.string().trim().max(500).optional(),
  description: z.string().max(2000).optional(),
  price: z.coerce.number({ invalid_type_error: "Enter a price" }).min(0, "Cannot be negative"),
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a quantity" })
    .int("Whole numbers only")
    .min(0, "Cannot be negative"),
});

export function ProductForm({ defaultValues, onSubmit, onCancel, submitting, mode = "create" }) {
  const { data: dynamicCategories } = useCategories();

  // Merge built-in categories with categories fetched from DB
  const categoriesList = Array.from(new Set([
    ...PRODUCT_CATEGORIES,
    ...(dynamicCategories ?? [])
  ])).filter(Boolean);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      sku: "",
      name: "",
      category: "Accessories",
      customCategory: "",
      image_url: "",
      description: "",
      price: "",
      quantity: 0,
    },
  });

  const watchedCategory = watch("category");

  const submit = (values) => {
    let finalCategory = values.category;
    if (values.category === "__new__") {
      finalCategory = values.customCategory?.trim();
      if (!finalCategory) {
        setError("customCategory", { type: "manual", message: "Category name is required" });
        return;
      }
    }

    onSubmit({
      sku: values.sku,
      name: values.name,
      category: finalCategory,
      image_url: values.image_url?.trim() || null,
      description: values.description?.trim() || null,
      price: values.price,
      quantity: values.quantity,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Field label="SKU" required error={errors.sku?.message}>
        <Input {...register("sku")} error={errors.sku} placeholder="e.g. KBD-MX-001" />
      </Field>

      <Field label="Name" required error={errors.name?.message}>
        <Input {...register("name")} error={errors.name} placeholder="Product name" />
      </Field>

      <Field label="Category" required error={errors.category?.message}>
        <Select {...register("category")} error={errors.category}>
          {categoriesList.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          <option value="__new__">+ Create new category...</option>
        </Select>
      </Field>

      {watchedCategory === "__new__" && (
        <Field label="Custom Category Name" required error={errors.customCategory?.message}>
          <Input
            {...register("customCategory")}
            error={errors.customCategory}
            placeholder="e.g. Smart Home"
          />
        </Field>
      )}

      <Field label="Image URL" hint="Optional — a broken link falls back to the product's initial" error={errors.image_url?.message}>
        <Input {...register("image_url")} error={errors.image_url} placeholder="https://…" />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <Textarea {...register("description")} error={errors.description} placeholder="Optional" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Price (₹)" required error={errors.price?.message}>
          <Input type="number" step="0.01" min="0" {...register("price")} error={errors.price} />
        </Field>
        <Field label="Quantity" required error={errors.quantity?.message}>
          <Input type="number" min="0" {...register("quantity")} error={errors.quantity} />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === "edit" ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
