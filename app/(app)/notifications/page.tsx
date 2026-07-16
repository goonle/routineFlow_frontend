import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Bell, BellOff, Check, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch, AuthError } from "@/lib/api";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/lib/types";
import type { NotificationListResponse, NotificationResponse } from "@/lib/types";

const PAGE_SIZE = 20;

interface NotificationsPageProps {
  searchParams: Promise<{ unreadOnly?: string; page?: string }>;
}

// The inner JSON shape of `content` isn't specified per notification type —
// render it generically as key/value pairs rather than assuming field names.
function parseContent(content: string): Record<string, unknown> | string {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    return content;
  } catch {
    return content;
  }
}

function notificationTypeMeta(type: NotificationResponse["type"]): { label: string; icon: typeof Bell } {
  switch (type) {
    case NotificationType.WeeklySummary:
      return { label: "Weekly summary", icon: Bell };
    case NotificationType.GoalPurgeWarning:
      return { label: "Goal purge warning", icon: AlertTriangle };
    default:
      return { label: "Notification", icon: Bell };
  }
}

function NotificationContent({ content }: { content: string }) {
  const parsed = parseContent(content);
  if (typeof parsed === "string") {
    return <p className="text-sm text-muted-foreground">{parsed}</p>;
  }
  return (
    <dl className="flex flex-col gap-0.5 text-sm text-muted-foreground">
      {Object.entries(parsed).map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <dt className="font-medium text-foreground">{key}:</dt>
          <dd>{typeof value === "string" ? value : JSON.stringify(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const params = await searchParams;
  const unreadOnly = params.unreadOnly === "true";
  const page = params.page ? Math.max(1, Number(params.page)) : 1;

  let data: NotificationListResponse;
  try {
    data = await apiFetch<NotificationListResponse>(
      `/api/notifications?unreadOnly=${unreadOnly}&page=${page}&pageSize=${PAGE_SIZE}`
    );
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  const totalPages = Math.max(1, Math.ceil(data.totalCount / data.pageSize));

  function pageHref(targetPage: number): string {
    const sp = new URLSearchParams();
    if (unreadOnly) sp.set("unreadOnly", "true");
    sp.set("page", String(targetPage));
    return `/notifications?${sp.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Weekly summaries and goal alerts.</p>
        </div>
        <form action={markAllNotificationsRead}>
          <Button type="submit" variant="outline" size="sm">
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </form>
      </div>

      <div className="flex w-fit items-center gap-1 rounded-lg bg-muted p-1 text-sm">
        <Link
          href="/notifications"
          className={cn(
            "rounded-md px-3 py-1 font-medium transition-colors",
            !unreadOnly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </Link>
        <Link
          href="/notifications?unreadOnly=true"
          className={cn(
            "rounded-md px-3 py-1 font-medium transition-colors",
            unreadOnly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Unread only
        </Link>
      </div>

      {data.items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BellOff className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">No notifications.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {data.items.map((notification) => {
            const { label, icon: Icon } = notificationTypeMeta(notification.type);
            return (
              <Card
                key={notification.id}
                className={cn("flex items-start gap-3 p-4", !notification.isRead && "border-primary/40 bg-accent/30")}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    notification.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                  <div className="mt-1">
                    <NotificationContent content={notification.content} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                {!notification.isRead && (
                  <form action={markNotificationRead.bind(null, notification.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      <Check className="h-3.5 w-3.5" />
                      Mark read
                    </Button>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              page <= 1 && "pointer-events-none opacity-40"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              page >= totalPages && "pointer-events-none opacity-40"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
