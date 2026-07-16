import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import { upsertDailyReport } from "@/lib/actions/daily-reports";
import { DailyReportForm } from "@/components/DailyReportForm";
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
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <div className="flex gap-3 text-sm">
          <Link
            href={viewHref("weekly")}
            className={view === "weekly" ? "font-semibold underline" : "text-gray-500 hover:underline"}
          >
            Weekly
          </Link>
          <Link
            href={viewHref("monthly")}
            className={view === "monthly" ? "font-semibold underline" : "text-gray-500 hover:underline"}
          >
            Monthly
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link href={prevNextHref(-1)} className="text-blue-600 underline dark:text-blue-400">
          ← Previous
        </Link>
        <span className="text-gray-500">
          {view === "monthly" ? `${year}-${String(month).padStart(2, "0")}` : `Week of ${weekStart}`}
        </span>
        <Link href={prevNextHref(1)} className="text-blue-600 underline dark:text-blue-400">
          Next →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const achievedCount = day.goals.filter((g) => g.achieved).length;
          const isToday = day.date === todayStr;
          return (
            <Link
              key={day.date}
              href={dayHref(day.date)}
              className={`flex flex-col gap-1 rounded border p-2 text-xs hover:border-blue-400 ${
                isToday ? "border-blue-500" : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{day.date.slice(-2)}</span>
                {day.emoji && <span>{day.emoji}</span>}
              </div>
              {day.goals.length > 0 && (
                <span className="text-gray-500">
                  {achievedCount}/{day.goals.length} achieved
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {params.editDate && (
        <section className="max-w-md rounded border border-gray-200 p-4 dark:border-gray-800">
          <h2 className="mb-3 text-lg font-medium">{params.editDate}</h2>
          <DailyReportForm
            action={upsertDailyReport.bind(null, params.editDate)}
            initialEmotion={editingReport?.emotion}
            initialDiaryText={editingReport?.diaryText ?? ""}
          />
        </section>
      )}
    </div>
  );
}
