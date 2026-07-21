import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskCheckbox({
  checked,
  label,
  onCheckAction,
  onUncheckAction,
}: {
  checked: boolean;
  label: string;
  onCheckAction: () => Promise<void>;
  onUncheckAction: () => Promise<void>;
}) {
  return (
    <form action={checked ? onUncheckAction : onCheckAction} className="flex items-center gap-2.5 py-1.5">
      <button
        type="submit"
        aria-pressed={checked}
        aria-label={checked ? `Mark "${label}" as not done` : `Mark "${label}" as done`}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:border-primary/60"
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>
      <span className={cn("text-sm text-left", checked && "text-muted-foreground line-through")}>{label}</span>
    </form>
  );
}
