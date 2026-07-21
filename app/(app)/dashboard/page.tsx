import { redirect } from "next/navigation";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import { upsertDailyReport } from "@/lib/actions/daily-reports";
import { todayIso, mondayOfThisWeekIso } from "@/lib/date";
import { TodayProgress } from "@/components/TodayProgress";
import { WeekProgress } from "@/components/WeekProgress";
import { TodayRoutine } from "@/components/TodayRoutine";
import { TodayJournalForm } from "@/components/TodayJournalForm";
import { Card } from "@/components/ui/Card";
import type { CalendarDay, DailyReport, Task, TaskCompletion } from "@/lib/types";

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

  let todayReport: DailyReport | null = null;
  try {
    todayReport = await apiFetch<DailyReport>(`/api/daily-reports/${today}`);
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    if (!(err instanceof ApiProblemError && err.status === 404)) throw err;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TodayProgress goals={goalSummaries} />
        <WeekProgress days={week} todayStr={today} />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <TodayRoutine goals={goalsWithTasks} />

        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today&apos;s journal</h2>
          <div className="mt-4">
            <TodayJournalForm
              action={upsertDailyReport.bind(null, today)}
              initialEmotion={todayReport?.emotion}
              initialDiaryText={todayReport?.diaryText ?? ""}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
