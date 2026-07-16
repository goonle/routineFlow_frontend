import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CompletionStepper({
  count,
  onIncrementAction,
  onDecrementAction,
}: {
  count: number;
  onIncrementAction: () => Promise<void>;
  onDecrementAction: () => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <form action={onDecrementAction}>
        <Button type="submit" variant="outline" size="icon" disabled={count === 0} aria-label="Undo completion">
          <Minus className="h-3.5 w-3.5" />
        </Button>
      </form>
      <span className="w-5 text-center text-sm tabular-nums">{count}</span>
      <form action={onIncrementAction}>
        <Button type="submit" variant="outline" size="icon" aria-label="Mark done">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
