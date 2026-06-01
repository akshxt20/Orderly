import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(2000).optional(),
});

export function CustomerForm({ defaultValues, onSubmit, onCancel, submitting, mode = "create" }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { name: "", email: "", phone: "", address: "" },
  });

  const submit = (values) => {
    onSubmit({
      ...values,
      phone: values.phone?.trim() || null,
      address: values.address?.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Field label="Name" required error={errors.name?.message}>
        <Input {...register("name")} error={errors.name} placeholder="Full name" />
      </Field>

      <Field label="Email" required error={errors.email?.message}>
        <Input type="email" {...register("email")} error={errors.email} placeholder="name@example.com" />
      </Field>

      <Field label="Phone" error={errors.phone?.message}>
        <Input {...register("phone")} error={errors.phone} placeholder="Optional" />
      </Field>

      <Field label="Address" error={errors.address?.message}>
        <Textarea {...register("address")} error={errors.address} placeholder="Optional" />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === "edit" ? "Save changes" : "Create customer"}
        </Button>
      </div>
    </form>
  );
}
