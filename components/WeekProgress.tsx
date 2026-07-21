import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { parseIsoDate } from "@/lib/date";
import type { CalendarDay } from "@/lib/types";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekProgressProps {
  days: CalendarDay[];
  todayStr: string;
}

export function WeekProgress({ days, todayStr }: WeekProgressProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">This week&apos;s progress</h2>
        <Link href="/calendar" className="text-sm text-primary hover:underline">
          View calendar
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const total = day.goals.length;
          const achieved = day.goals.filter((g) => g.achieved).length;
          const complete = total > 0 && achieved === total;
          const isToday = day.date === todayStr;
          const dayNum = parseIsoDate(day.date).getDate();

          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <span className={cn("text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                {WEEKDAY_LABELS[i]}
              </span>
              <span className={cn("text-sm font-semibold", isToday && "text-primary")}>{dayNum}</span>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md border",
                  complete
                    ? "border-success bg-success text-success-foreground"
                    : cn("border-border bg-background", isToday && "border-primary/60")
                )}
                title={total > 0 ? `${achieved}/${total} goals achieved (${Math.round((achieved / total) * 100)}%)` : "No goals scheduled"}
              >
                {complete && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
