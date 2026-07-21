"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { FormError } from "@/components/ui/FormError";
import { GoalColor, GoalColorHex, GoalIcon, GoalIconEmojis } from "@/lib/types";
import type { FormState } from "@/lib/types";
import { cn } from "@/lib/utils";

type GoalFormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

const ICON_ORDER = Object.values(GoalIcon);
const COLOR_ORDER = Object.values(GoalColor);

export function GoalForm({
  action,
  initialName = "",
  initialDescription = "",
  initialIcon = GoalIcon.General,
  initialColor = GoalColor.Red,
  submitLabel = "Save",
  onSuccessAction,
  onCancelAction,
}: {
  action: GoalFormAction;
  initialName?: string;
  initialDescription?: string;
  initialIcon?: GoalIcon;
  initialColor?: GoalColor;
  submitLabel?: string;
  onSuccessAction?: () => void;
  onCancelAction?: () => void;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});
  const wasPending = useRef(false);

  useEffect(() => {
    const succeeded = wasPending.current && !isPending && !state.error && !state.fieldErrors;
    if (succeeded) onSuccessAction?.();
    wasPending.current = isPending;
  }, [isPending, state, onSuccessAction]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state.error} />

      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Icon</Label>
        <div className="grid grid-cols-8 gap-2">
          {ICON_ORDER.map((icon) => (
            <label key={icon} className="cursor-pointer">
              <input type="radio" name="icon" value={icon} defaultChecked={initialIcon === icon} className="peer sr-only" />
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-lg leading-none transition-colors peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary/30">
                {GoalIconEmojis[icon]}
              </span>
            </label>
          ))}
        </div>
        <FieldError messages={state.fieldErrors?.icon} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_ORDER.map((color) => (
            <label key={color} className="cursor-pointer">
              <input type="radio" name="color" value={color} defaultChecked={initialColor === color} className="peer sr-only" />
              <span
                className="block h-7 w-7 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-card transition-all peer-checked:ring-foreground/70"
                style={{ backgroundColor: GoalColorHex[color] }}
              />
            </label>
          ))}
        </div>
        <FieldError messages={state.fieldErrors?.color} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Goal name *
        </Label>
        <Input id="name" name="name" defaultValue={initialName} required placeholder="e.g. Lose weight, Learn English..." />
        <FieldError messages={state.fieldErrors?.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Description
        </Label>
        <Textarea id="description" name="description" defaultValue={initialDescription} rows={2} placeholder="Describe your goal..." />
        <FieldError messages={state.fieldErrors?.description} />
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
