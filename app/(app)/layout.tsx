import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { apiFetch, AuthError } from "@/lib/api";
import type { NotificationListResponse } from "@/lib/types";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/goals", label: "Goals" },
  { href: "/calendar", label: "Calendar" },
  { href: "/notifications", label: "Notifications" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let unreadCount = 0;
  try {
    const unread = await apiFetch<NotificationListResponse>("/api/notifications?unreadOnly=true&page=1&pageSize=1");
    unreadCount = unread.totalCount;
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    // Non-fatal — the nav still renders without the badge.
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="font-semibold">RoutineFlow</span>
          <nav className="flex flex-wrap gap-4 text-sm">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {link.label}
                {link.href === "/notifications" && unreadCount > 0 && (
                  <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
            Log out
          </button>
        </form>
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
