import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Goal, Task } from "@/lib/types";

export interface TaskActionStat {
  task: Task;
  daysCompleted: number;
  target: number | null;
}

export interface GoalActionStats {
  goal: Goal;
  totalCompletedDays: number;
  tasks: TaskActionStat[];
}

export function ActionStatsByGoal({ stats }: { stats: GoalActionStats[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action stats by goal</h2>

      {stats.length === 0 ? (
        <Card className="p-5 text-sm text-muted-foreground">No goals to show yet.</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {stats.map(({ goal, totalCompletedDays, tasks }) => (
            <Card key={goal.id} className="overflow-hidden p-0">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base leading-none"
                      style={{ backgroundColor: `${goal.colorHex}1f` }}
                    >
                      {goal.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {totalCompletedDays} action{totalCompletedDays === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>

                <div className="flex flex-col gap-3 border-t border-border px-4 pb-4 pt-3">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks for this goal.</p>
                  ) : (
                    tasks.map(({ task, daysCompleted, target }) => {
                      const percent = target && target > 0 ? Math.min(100, Math.round((daysCompleted / target) * 100)) : 0;
                      return (
                        <div key={task.id} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate">{task.name}</span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                              {target !== null
                                ? `${daysCompleted}/${target} days (${percent}%)`
                                : `${daysCompleted} action${daysCompleted === 1 ? "" : "s"}`}
                            </span>
                          </div>
                          {target !== null && (
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${percent}%`, backgroundColor: percent > 0 ? goal.colorHex : undefined }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </details>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
