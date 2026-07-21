import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { CalendarGoalSummary } from "@/lib/types";

export function TodayProgress({ goals }: { goals: CalendarGoalSummary[] }) {
  const achieved = goals.filter((g) => g.achieved).length;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today&apos;s progress</h2>
        {goals.length > 0 && (
          <Badge variant={achieved === goals.length ? "success" : "muted"}>
            {achieved}/{goals.length} achieved
          </Badge>
        )}
      </div>

      {goals.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No goals scheduled for today.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {goals.map((goal) => (
            <span
              key={goal.goalId}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
                goal.achieved
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border bg-muted/40 text-foreground"
              )}
            >
              <span className="leading-none">{goal.emoji}</span>
              {goal.name}
              {goal.achieved && <CheckCircle2 className="h-3.5 w-3.5" />}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
