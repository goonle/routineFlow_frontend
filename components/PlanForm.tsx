"use client";

import { useActionState, useState } from "react";
import { PlanType, PlanTypeLabels } from "@/lib/types";
import type { FormState } from "@/lib/types";

type PlanFormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export function PlanForm({
  action,
  initialType,
  initialStartDate = "",
  initialEndDate = "",
  initialRepeatCount = 1,
  submitLabel,
}: {
  action: PlanFormAction;
  initialType?: PlanType;
  initialStartDate?: string;
  initialEndDate?: string;
  initialRepeatCount?: number;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});
  const [type, setType] = useState<PlanType>(initialType ?? PlanType.Weekly);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex flex-col gap-1">
        <label htmlFor="type" className="text-sm font-medium">
          Type
        </label>
        <select
          id="type"
          name="type"
          defaultValue={type}
          onChange={(e) => setType(Number(e.target.value) as PlanType)}
          className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        >
          {Object.entries(PlanTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.type?.map((m) => (
          <p key={m} className="text-sm text-red-600 dark:text-red-400">
            {m}
          </p>
        ))}
      </div>

      {type === PlanType.Custom && (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor="startDate" className="text-sm font-medium">
              Start date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={initialStartDate}
              className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
            />
            {state.fieldErrors?.startDate?.map((m) => (
              <p key={m} className="text-sm text-red-600 dark:text-red-400">
                {m}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="endDate" className="text-sm font-medium">
              End date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={initialEndDate}
              className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
            />
            {state.fieldErrors?.endDate?.map((m) => (
              <p key={m} className="text-sm text-red-600 dark:text-red-400">
                {m}
              </p>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="repeatCount" className="text-sm font-medium">
          Repeat count
        </label>
        <input
          id="repeatCount"
          name="repeatCount"
          type="number"
          min={0}
          defaultValue={initialRepeatCount}
          className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        {state.fieldErrors?.repeatCount?.map((m) => (
          <p key={m} className="text-sm text-red-600 dark:text-red-400">
            {m}
          </p>
        ))}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {isPending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
