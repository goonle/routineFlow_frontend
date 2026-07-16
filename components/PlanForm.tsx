"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { FormError } from "@/components/ui/FormError";
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
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Type</Label>
        <Select
          id="type"
          name="type"
          defaultValue={type}
          onChange={(e) => setType(Number(e.target.value) as PlanType)}
        >
          {Object.entries(PlanTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <FieldError messages={state.fieldErrors?.type} />
      </div>

      {type === PlanType.Custom && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" name="startDate" type="date" defaultValue={initialStartDate} />
            <FieldError messages={state.fieldErrors?.startDate} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" name="endDate" type="date" defaultValue={initialEndDate} />
            <FieldError messages={state.fieldErrors?.endDate} />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="repeatCount">Repeat count</Label>
        <Input id="repeatCount" name="repeatCount" type="number" min={0} defaultValue={initialRepeatCount} />
        <FieldError messages={state.fieldErrors?.repeatCount} />
      </div>

      <Button type="submit" disabled={isPending} size="sm" className="self-start">
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
