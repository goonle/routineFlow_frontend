import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import { upsertDailyReport } from "@/lib/actions/daily-reports";
import { ActionStatsByGoal } from "@/components/ActionStatsByGoal";
import type { GoalActionStats, TaskActionStat } from "@/components/ActionStatsByGoal";
import { DayDetailModal } from "@/components/DayDetailModal";
import type { CompletedGoalActions } from "@/components/DayDetailModal";
import { cn } from "@/lib/utils";
import { todayIso, toIsoDate, parseIsoDate, mondayIndex, mondayOfWeek, mondayOfThisWeekIso } from "@/lib/date";
import { EmotionLabels, PlanType } from "@/lib/types";
import type { CalendarDay, DailyReport, Goal, Plan, Task, TaskCompletion } from "@/lib/types";

type ViewMode = "weekly" | "monthly";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarPageProps {
  searchParams: Promise<{
    view?: string;
    date?: string;
    year?: string;
    month?: string;
    editDate?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const view: ViewMode = params.view === "monthly" ? "monthly" : "weekly";
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1; // 1-12
  const weekStart = params.date || mondayOfThisWeekIso();

  let days: CalendarDay[];
  try {
    days =
      view === "monthly"
        ? await apiFetch<CalendarDay[]>(`/api/calendar/monthly?year=${year}&month=${month}`)
        : await apiFetch<CalendarDay[]>(`/api/calendar/weekly?startDate=${weekStart}`);
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  let goals: Goal[];
  try {
    goals = await apiFetch<Goal[]>("/api/goals");
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  const goalsWithTasks: { goal: Goal; tasks: Task[]; plan: Plan | null }[] = [];
  for (const goal of goals) {
    let tasks: Task[];
    try {
      tasks = await apiFetch<Task[]>(`/api/goals/${goal.id}/tasks`);
    } catch (err) {
      if (err instanceof AuthError) redirect("/login");
      throw err;
    }

    let plan: Plan | null;
    try {
      plan = await apiFetch<Plan>(`/api/goals/${goal.id}/plan`);
    } catch (err) {
      if (err instanceof AuthError) redirect("/login");
      if (err instanceof ApiProblemError && err.status === 404) {
        plan = null;
      } else {
        throw err;
      }
    }

    goalsWithTasks.push({ goal, tasks, plan });
  }

  // A task's progress is tracked against its goal's Plan for the *current* cycle
  // (this week / this month / the plan's custom range) — not the calendar's
  // currently displayed range, which may show a different week or month.
  const rangeFallback = days.length > 0 ? { start: days[0].date, end: days[days.length - 1].date } : null;
  const today = new Date();

  function resolveTrackingPeriod(plan: Plan | null): { start: string | null; end: string | null; target: number | null } {
    if (plan) {
      if (plan.type === PlanType.Weekly) {
        const start = mondayOfWeek(today);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return { start: toIsoDate(start), end: toIsoDate(end), target: plan.repeatCount };
      }
      if (plan.type === PlanType.Monthly) {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start: toIsoDate(start), end: toIsoDate(end), target: plan.repeatCount };
      }
      if (plan.type === PlanType.Custom && plan.startDate && plan.endDate) {
        return { start: plan.startDate, end: plan.endDate, target: plan.repeatCount };
      }
    }
    return { start: rangeFallback?.start ?? null, end: rangeFallback?.end ?? null, target: null };
  }

  const goalStats: GoalActionStats[] = [];
  for (const { goal, tasks, plan } of goalsWithTasks) {
    const { start: periodStart, end: periodEnd, target } = resolveTrackingPeriod(plan);

    const taskStats: TaskActionStat[] = [];
    for (const task of tasks) {
      let daysCompleted = 0;
      if (periodStart && periodEnd) {
        let completions: TaskCompletion[];
        try {
          completions = await apiFetch<TaskCompletion[]>(
            `/api/tasks/${task.id}/completions?from=${periodStart}&to=${periodEnd}`
          );
        } catch (err) {
          if (err instanceof AuthError) redirect("/login");
          throw err;
        }
        daysCompleted = completions.length;
      }
      taskStats.push({ task, daysCompleted, target: periodStart && periodEnd ? target : null });
    }

    goalStats.push({
      goal,
      totalCompletedDays: taskStats.reduce((sum, t) => sum + t.daysCompleted, 0),
      tasks: taskStats,
    });
  }

  let editingReport: DailyReport | null = null;
  if (params.editDate) {
    try {
      editingReport = await apiFetch<DailyReport>(`/api/daily-reports/${params.editDate}`);
    } catch (err) {
      if (err instanceof AuthError) redirect("/login");
      if (err instanceof ApiProblemError && err.status === 404) {
        editingReport = null;
      } else {
        throw err;
      }
    }
  }

  const completedGoalsForEditDate: CompletedGoalActions[] = [];
  if (params.editDate) {
    for (const { goal, tasks } of goalsWithTasks) {
      const completedTasks: Task[] = [];
      for (const task of tasks) {
        let completions: TaskCompletion[];
        try {
          completions = await apiFetch<TaskCompletion[]>(
            `/api/tasks/${task.id}/completions?from=${params.editDate}&to=${params.editDate}`
          );
        } catch (err) {
          if (err instanceof AuthError) redirect("/login");
          throw err;
        }
        if ((completions[0]?.count ?? 0) > 0) completedTasks.push(task);
      }
      if (completedTasks.length > 0) completedGoalsForEditDate.push({ goal, tasks: completedTasks });
    }
  }

  const todayStr = todayIso();

  function dayHref(date: string): string {
    const sp = new URLSearchParams();
    sp.set("view", view);
    if (view === "monthly") {
      sp.set("year", String(year));
      sp.set("month", String(month));
    } else {
      sp.set("date", weekStart);
    }
    sp.set("editDate", date);
    return `/calendar?${sp.toString()}`;
  }

  function viewHref(nextView: ViewMode): string {
    const sp = new URLSearchParams();
    sp.set("view", nextView);
    if (nextView === "monthly") {
      sp.set("year", String(year));
      sp.set("month", String(month));
    } else {
      sp.set("date", weekStart);
    }
    return `/calendar?${sp.toString()}`;
  }

  function prevNextHref(direction: -1 | 1): string {
    const sp = new URLSearchParams();
    sp.set("view", view);
    if (view === "monthly") {
      const d = new Date(year, month - 1 + direction, 1);
      sp.set("year", String(d.getFullYear()));
      sp.set("month", String(d.getMonth() + 1));
    } else {
      const d = parseIsoDate(weekStart);
      d.setDate(d.getDate() + direction * 7);
      sp.set("date", toIsoDate(d));
    }
    return `/calendar?${sp.toString()}`;
  }

  function closeHref(): string {
    const sp = new URLSearchParams();
    sp.set("view", view);
    if (view === "monthly") {
      sp.set("year", String(year));
      sp.set("month", String(month));
    } else {
      sp.set("date", weekStart);
    }
    return `/calendar?${sp.toString()}`;
  }

  const leadingBlanks = view === "monthly" ? mondayIndex(new Date(year, month - 1, 1)) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Track daily emotions and goal achievement over time.</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1 text-sm">
          <Link
            href={viewHref("weekly")}
            className={cn(
              "rounded-md px-3 py-1 font-medium transition-colors",
              view === "weekly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Weekly
          </Link>
          <Link
            href={viewHref("monthly")}
            className={cn(
              "rounded-md px-3 py-1 font-medium transition-colors",
              view === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={prevNextHref(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-medium text-foreground">
          {view === "monthly" ? `${year}-${String(month).padStart(2, "0")}` : `Week of ${weekStart}`}
        </span>
        <Link
          href={prevNextHref(1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const total = day.goals.length;
          const achievedCount = day.goals.filter((g) => g.achieved).length;
          const ratio = total > 0 ? achievedCount / total : 0;
          const isToday = day.date === todayStr;
          const isEditing = day.date === params.editDate;
          return (
            <Link
              key={day.date}
              href={dayHref(day.date)}
              className={cn(
                "flex min-h-20 flex-col gap-2 rounded-lg border p-2 text-xs transition-colors hover:border-primary/50 hover:bg-accent/40",
                isEditing
                  ? "border-primary bg-accent/60"
                  : isToday
                    ? "border-primary/60 bg-accent/20"
                    : "border-border bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("font-semibold", isToday && "text-primary")}>{day.date.slice(-2)}</span>
                {day.emoji && <span>{day.emoji}</span>}
              </div>
              {total > 0 && (
                <div className="mt-auto flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">
                    {achievedCount}/{total}
                  </span>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", ratio === 1 ? "bg-success" : "bg-primary")}
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <ActionStatsByGoal stats={goalStats} />

      <DayDetailModal
        open={Boolean(params.editDate)}
        closeHref={closeHref()}
        dateLabel={
          params.editDate
            ? parseIsoDate(params.editDate).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                weekday: "long",
              })
            : ""
        }
        emotionEmoji={editingReport?.emoji}
        emotionLabel={editingReport?.emotion !== undefined ? EmotionLabels[editingReport.emotion] : undefined}
        diaryText={editingReport?.diaryText}
        completedGoals={completedGoalsForEditDate}
        reportAction={upsertDailyReport.bind(null, params.editDate ?? todayStr)}
        initialEmotion={editingReport?.emotion}
      />
    </div>
  );
}
