import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TaskCheckbox } from "@/components/TaskCheckbox";
import { completeTask, undoTaskCompletion } from "@/lib/actions/completions";
import { todayIso } from "@/lib/date";
import type { Task } from "@/lib/types";

interface RoutineGoal {
  goalId: string;
  name: string;
  emoji: string;
  tasks: { task: Task; todayCount: number }[];
}

export function TodayRoutine({ goals }: { goals: RoutineGoal[] }) {
  const today = todayIso();

  return (
    <Card className="flex flex-col p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today&apos;s routine</h2>

      {goals.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <Link href="/goals" className="text-primary hover:underline">
              Create a goal
            </Link>{" "}
            to build your routine.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col divide-y divide-border">
          {goals.map((goal) => {
            const done = goal.tasks.filter((t) => t.todayCount > 0).length;
            return (
              <div key={goal.goalId} className="py-3 first:pt-0 last:pb-0">
                <Link href={`/goals/${goal.goalId}`} className="flex items-center gap-2.5 hover:underline">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-base leading-none">
                    {goal.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {done}/{goal.tasks.length} done
                    </p>
                  </div>
                </Link>

                <div className="mt-1 flex flex-col pl-10.5">
                  {goal.tasks.length === 0 ? (
                    <p className="py-1.5 text-sm text-muted-foreground">No tasks for this goal.</p>
                  ) : (
                    goal.tasks.map(({ task, todayCount }) => (
                      <TaskCheckbox
                        key={task.id}
                        label={task.name}
                        checked={todayCount > 0}
                        onCheckAction={completeTask.bind(null, goal.goalId, task.id)}
                        onUncheckAction={undoTaskCompletion.bind(null, goal.goalId, task.id, today)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
