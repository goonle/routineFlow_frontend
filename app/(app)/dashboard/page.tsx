import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch, AuthError } from "@/lib/api";
import { completeTask, undoTaskCompletion } from "@/lib/actions/completions";
import { todayIso, mondayOfThisWeekIso } from "@/lib/date";
import type { CalendarDay, Task, TaskCompletion } from "@/lib/types";

interface GoalWithTasks {
  goalId: string;
  name: string;
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Today</h1>
        {todayEntry?.emoji && <span className="text-2xl">{todayEntry.emoji}</span>}
      </div>

      {goalsWithTasks.length === 0 && (
        <p className="text-sm text-gray-500">
          No goals yet.{" "}
          <Link href="/goals" className="text-blue-600 underline dark:text-blue-400">
            Create one
          </Link>{" "}
          to get started.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {goalsWithTasks.map((goal) => (
          <div key={goal.goalId} className="rounded border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <Link href={`/goals/${goal.goalId}`} className="font-medium hover:underline">
                {goal.name}
              </Link>
              <span
                className={
                  goal.achieved
                    ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950 dark:text-green-400"
                    : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }
              >
                {goal.achieved ? "Achieved" : "Not yet"}
              </span>
            </div>

            {goal.tasks.length === 0 && <p className="mt-2 text-sm text-gray-500">No tasks for this goal.</p>}

            <div className="mt-3 flex flex-col gap-2">
              {goal.tasks.map(({ task, todayCount }) => (
                <div key={task.id} className="flex items-center justify-between text-sm">
                  <span>{task.name}</span>
                  <div className="flex items-center gap-2">
                    <form action={undoTaskCompletion.bind(null, goal.goalId, task.id, today)}>
                      <button
                        type="submit"
                        disabled={todayCount === 0}
                        className="h-6 w-6 rounded border border-gray-300 text-xs disabled:opacity-30 dark:border-gray-700"
                        aria-label="Undo completion"
                      >
                        −
                      </button>
                    </form>
                    <span className="w-5 text-center">{todayCount}</span>
                    <form action={completeTask.bind(null, goal.goalId, task.id)}>
                      <button
                        type="submit"
                        className="h-6 w-6 rounded border border-gray-300 text-xs dark:border-gray-700"
                        aria-label="Mark done"
                      >
                        +
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
