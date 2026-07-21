"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { FormError } from "@/components/ui/FormError";
import type { FormState } from "@/lib/types";
import { cn } from "@/lib/utils";

type TaskFormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export function TaskForm({
  action,
  initialName = "",
  initialDescription = "",
  initialAchieveAction = "",
  submitLabel = "Save",
  resetOnSuccess = false,
  onSuccessAction,
  onCancelAction,
}: {
  action: TaskFormAction;
  initialName?: string;
  initialDescription?: string;
  initialAchieveAction?: string;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  onSuccessAction?: () => void;
  onCancelAction?: () => void;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    const succeeded = wasPending.current && !isPending && !state.error && !state.fieldErrors;
    if (succeeded && resetOnSuccess) {
      formRef.current?.reset();
    }
    if (succeeded) onSuccessAction?.();
    wasPending.current = isPending;
  }, [isPending, state, resetOnSuccess, onSuccessAction]);

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
        <Label htmlFor="achieveAction">Achieve action</Label>
        <Input
          id="achieveAction"
          name="achieveAction"
          defaultValue={initialAchieveAction}
          required
          placeholder="What counts as doing this task?"
        />
        <FieldError messages={state.fieldErrors?.achieveAction} />
      </div>

      <div className={cn("flex gap-2", onCancelAction ? "flex-row" : "flex-row-reverse")}>
        {onCancelAction && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancelAction}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending} className={onCancelAction ? "flex-1" : undefined}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
