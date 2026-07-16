import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Repeat } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { apiFetch, AuthError } from "@/lib/api";
import { SidebarNav } from "@/components/SidebarNav";
import type { NotificationListResponse } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let unreadCount = 0;
  try {
    const unread = await apiFetch<NotificationListResponse>("/api/notifications?unreadOnly=true&page=1&pageSize=1");
    unreadCount = unread.totalCount;
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    // Non-fatal otherwise — the nav still renders without the badge.
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border px-4 py-6 md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Repeat className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-tight">RoutineFlow</span>
        </Link>

        <SidebarNav unreadCount={unreadCount} />

        <form action={logout} className="mt-auto">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Repeat className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold tracking-tight">RoutineFlow</span>
          </Link>
          <form action={logout}>
            <button type="submit" aria-label="Log out" className="text-muted-foreground">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-6">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card md:hidden">
          <SidebarNav unreadCount={unreadCount} orientation="horizontal" />
        </nav>
      </div>
    </div>
  );
}
