import Link from "next/link";
import { Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { CalendarDay } from "@/lib/types";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Grey (low completion) -> gold (full completion). See app/globals.css for the
// light/dark values and the dataviz skill's ordinal-ramp validation.
const PROGRESS_COLORS = ["text-progress-0", "text-progress-1", "text-progress-2", "text-progress-3", "text-progress-4"];

interface WeekProgressProps {
  days: CalendarDay[];
  todayStr: string;
}

export function WeekProgress({ days, todayStr }: WeekProgressProps) {
  const stats = days.map((day) => {
    const total = day.goals.length;
    const achieved = day.goals.filter((g) => g.achieved).length;
    const ratio = total > 0 ? achieved / total : 0;
    const bucket = total > 0 ? Math.min(4, Math.floor(ratio * 5)) : null;
    return { day, total, achieved, ratio, bucket };
  });

  const trackedDays = stats.filter((s) => s.total > 0);
  const avgRatio =
    trackedDays.length > 0 ? trackedDays.reduce((sum, s) => sum + s.ratio, 0) / trackedDays.length : 0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">This week</h2>
          <p className="text-sm text-muted-foreground">
            {trackedDays.length > 0 ? `${Math.round(avgRatio * 100)}% avg completion` : "No goals tracked yet"}
          </p>
        </div>
        <Link href="/calendar" className="text-sm text-primary hover:underline">
          View calendar
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {stats.map(({ day, total, achieved, ratio, bucket }, i) => {
          const isToday = day.date === todayStr;
          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full bg-muted/40",
                  isToday && "ring-1 ring-inset ring-primary/60"
                )}
                title={
                  total > 0
                    ? `${achieved}/${total} goals achieved (${Math.round(ratio * 100)}%)`
                    : "No goals scheduled"
                }
              >
                <Target
                  className={cn("h-6 w-6", bucket !== null ? PROGRESS_COLORS[bucket] : "text-border")}
                  strokeWidth={bucket !== null ? 2 : 1.5}
                />
              </div>
              <span className={cn("text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                {WEEKDAY_LABELS[i]}
              </span>
              <span className="text-[11px] text-muted-foreground">{total > 0 ? `${achieved}/${total}` : "—"}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
