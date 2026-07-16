import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import { upsertDailyReport } from "@/lib/actions/daily-reports";
import { DailyReportForm } from "@/components/DailyReportForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { todayIso, toIsoDate, parseIsoDate, mondayIndex, mondayOfThisWeekIso } from "@/lib/date";
import type { CalendarDay, DailyReport } from "@/lib/types";

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

      {params.editDate && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{params.editDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyReportForm
              action={upsertDailyReport.bind(null, params.editDate)}
              initialEmotion={editingReport?.emotion}
              initialDiaryText={editingReport?.diaryText ?? ""}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
