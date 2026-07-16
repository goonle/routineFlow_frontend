import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { apiFetch, AuthError } from "@/lib/api";
import { completeTask, undoTaskCompletion } from "@/lib/actions/completions";
import { todayIso, mondayOfThisWeekIso } from "@/lib/date";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CompletionStepper } from "@/components/CompletionStepper";
import { WeekProgress } from "@/components/WeekProgress";
import type { CalendarDay, Task, TaskCompletion } from "@/lib/types";

interface GoalWithTasks {
  goalId: string;
  name: string;
  emoji: string;
  achieved: boolean;
  tasks: { task: Task; todayCount: number }[];
}

export default async function DashboardPage() {
  const today = todayIso();

  let week: CalendarDay[];
  try {
    week = await apiFetch<CalendarDay[]>(`/api/calendar/weekly?startDate=${mondayOfThisWeekIso()}`);
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  const todayEntry = week.find((day) => day.date === today);
  const goalSummaries = todayEntry?.goals ?? [];

  const goalsWithTasks: GoalWithTasks[] = [];
  for (const summary of goalSummaries) {
    let tasks: Task[];
    try {
      tasks = await apiFetch<Task[]>(`/api/goals/${summary.goalId}/tasks`);
    } catch (err) {
      if (err instanceof AuthError) redirect("/login");
      throw err;
    }

    const tasksWithCounts: { task: Task; todayCount: number }[] = [];
    for (const task of tasks) {
      try {
        const completions = await apiFetch<TaskCompletion[]>(
          `/api/tasks/${task.id}/completions?from=${today}&to=${today}`
        );
        tasksWithCounts.push({ task, todayCount: completions[0]?.count ?? 0 });
      } catch (err) {
        if (err instanceof AuthError) redirect("/login");
        throw err;
      }
    }

    goalsWithTasks.push({ ...summary, tasks: tasksWithCounts });
  }

  const achievedCount = goalsWithTasks.filter((g) => g.achieved).length;
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
          <p className="text-sm text-muted-foreground">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {todayEntry?.emoji && <span className="text-2xl leading-none">{todayEntry.emoji}</span>}
          {goalsWithTasks.length > 0 && (
            <Badge variant={achievedCount === goalsWithTasks.length ? "success" : "muted"} className="h-fit">
              {achievedCount}/{goalsWithTasks.length} achieved
            </Badge>
          )}
        </div>
      </div>

      <WeekProgress days={week} todayStr={today} />

      {goalsWithTasks.length === 0 && (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium">No goals yet</p>
            <p className="text-sm text-muted-foreground">
              <Link href="/goals" className="text-primary hover:underline">
                Create a goal
              </Link>{" "}
              to see it here.
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {goalsWithTasks.map((goal) => (
          <Card key={goal.goalId} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <Link href={`/goals/${goal.goalId}`} className="flex items-center gap-2 font-medium hover:underline">
                <span className="text-lg leading-none">{goal.emoji}</span>
                {goal.name}
              </Link>
              <Badge variant={goal.achieved ? "success" : "muted"}>
                {goal.achieved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                {goal.achieved ? "Achieved" : "Not yet"}
              </Badge>
            </div>

            {goal.tasks.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No tasks for this goal.</p>}

            <div className="mt-3 flex flex-col divide-y divide-border">
              {goal.tasks.map(({ task, todayCount }) => (
                <div key={task.id} className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0">
                  <span>{task.name}</span>
                  <CompletionStepper
                    count={todayCount}
                    onIncrementAction={completeTask.bind(null, goal.goalId, task.id)}
                    onDecrementAction={undoTaskCompletion.bind(null, goal.goalId, task.id, today)}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
