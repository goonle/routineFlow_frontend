"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FieldError } from "@/components/ui/FieldError";
import { FormError } from "@/components/ui/FormError";
import { GoalIcon, GoalIconEmojis, GoalIconLabels } from "@/lib/types";
import type { FormState } from "@/lib/types";

type GoalFormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export function GoalForm({
  action,
  initialName = "",
  initialDescription = "",
  initialIcon = GoalIcon.General,
  submitLabel = "Save",
  resetOnSuccess = false,
}: {
  action: GoalFormAction;
  initialName?: string;
  initialDescription?: string;
  initialIcon?: GoalIcon;
  submitLabel?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    const succeeded = wasPending.current && !isPending && !state.error && !state.fieldErrors;
    if (succeeded && resetOnSuccess) {
      formRef.current?.reset();
    }
    wasPending.current = isPending;
  }, [isPending, state, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initialName} required />
        <FieldError messages={state.fieldErrors?.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={initialDescription} rows={2} />
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="icon">Icon</Label>
        <Select id="icon" name="icon" defaultValue={initialIcon}>
          {Object.entries(GoalIconLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {GoalIconEmojis[Number(value) as GoalIcon]} {label}
            </option>
          ))}
        </Select>
        <FieldError messages={state.fieldErrors?.icon} />
      </div>

      <Button type="submit" disabled={isPending} size="sm" className="self-start">
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
