"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, Category, Expense } from "@/types/expense";
import { getTodayString } from "@/lib/utils";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be a positive number"
    ),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  description: z
    .string()
    .min(1, "Description is required")
    .max(100, "Description must be under 100 characters"),
});

type FormValues = z.infer<typeof schema>;

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  initialValues?: Expense;
  isEditing?: boolean;
}

const categoryOptions = [
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function ExpenseForm({ onSubmit, onCancel, initialValues, isEditing }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: initialValues?.date || getTodayString(),
      amount: initialValues?.amount?.toString() || "",
      category: initialValues?.category || "Food",
      description: initialValues?.description || "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        date: initialValues.date,
        amount: initialValues.amount.toString(),
        category: initialValues.category,
        description: initialValues.description,
      });
    }
  }, [initialValues, reset]);

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      date: values.date,
      amount: parseFloat(parseFloat(values.amount).toFixed(2)),
      category: values.category,
      description: values.description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          max={getTodayString()}
          error={errors.date?.message}
          {...register("date")}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Amount</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm font-medium">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="999999"
              placeholder="0.00"
              className={`block w-full rounded-lg border bg-white pl-7 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.amount ? "border-red-400" : "border-gray-300 hover:border-gray-400"
              }`}
              {...register("amount")}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-red-600">{errors.amount.message}</p>
          )}
        </div>
      </div>

      <Select
        label="Category"
        options={categoryOptions}
        error={errors.category?.message}
        {...register("category")}
      />

      <Input
        label="Description"
        placeholder="What did you spend on?"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          loading={isSubmitting}
        >
          {isEditing ? "Save Changes" : "Add Expense"}
        </Button>
      </div>
    </form>
  );
}
