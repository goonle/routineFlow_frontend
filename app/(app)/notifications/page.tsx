import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch, AuthError } from "@/lib/api";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
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

function notificationTypeLabel(type: NotificationResponse["type"]): string {
  switch (type) {
    case NotificationType.WeeklySummary:
      return "Weekly summary";
    case NotificationType.GoalPurgeWarning:
      return "Goal purge warning";
    default:
      return "Notification";
  }
}

function NotificationContent({ content }: { content: string }) {
  const parsed = parseContent(content);
  if (typeof parsed === "string") {
    return <p className="text-sm text-gray-600 dark:text-gray-400">{parsed}</p>;
  }
  return (
    <dl className="mt-1 flex flex-col gap-0.5 text-sm text-gray-600 dark:text-gray-400">
      {Object.entries(parsed).map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <dt className="font-medium">{key}:</dt>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <form action={markAllNotificationsRead}>
          <button type="submit" className="text-sm text-blue-600 underline dark:text-blue-400">
            Mark all read
          </button>
        </form>
      </div>

      <div className="flex gap-3 text-sm">
        <Link href="/notifications" className={!unreadOnly ? "font-semibold underline" : "text-gray-500 hover:underline"}>
          All
        </Link>
        <Link
          href="/notifications?unreadOnly=true"
          className={unreadOnly ? "font-semibold underline" : "text-gray-500 hover:underline"}
        >
          Unread only
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {data.items.length === 0 && <p className="text-sm text-gray-500">No notifications.</p>}
        {data.items.map((notification) => (
          <div
            key={notification.id}
            className={`rounded border p-4 ${
              notification.isRead
                ? "border-gray-200 dark:border-gray-800"
                : "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  {notificationTypeLabel(notification.type)}
                </p>
                <NotificationContent content={notification.content} />
                <p className="mt-1 text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
              {!notification.isRead && (
                <form action={markNotificationRead.bind(null, notification.id)}>
                  <button type="submit" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                    Mark read
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            className={
              page <= 1 ? "pointer-events-none text-gray-300 dark:text-gray-700" : "text-blue-600 underline dark:text-blue-400"
            }
          >
            ← Previous
          </Link>
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            className={
              page >= totalPages
                ? "pointer-events-none text-gray-300 dark:text-gray-700"
                : "text-blue-600 underline dark:text-blue-400"
            }
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
