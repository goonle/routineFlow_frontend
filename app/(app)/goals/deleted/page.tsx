import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Inbox, RotateCcw } from "lucide-react";
import { apiFetch, AuthError } from "@/lib/api";
import { restoreGoal } from "@/lib/actions/goals";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Goal } from "@/lib/types";

export default async function DeletedGoalsPage() {
  let goals: Goal[];
  try {
    goals = await apiFetch<Goal[]>("/api/goals/deleted");
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deleted goals</h1>
          <p className="text-sm text-muted-foreground">Restore a goal to bring it back to your active list.</p>
        </div>
        <Link href="/goals">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to goals
          </Button>
        </Link>
      </div>

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">No deleted goals.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {goals.map((goal) => (
            <Card key={goal.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-xl leading-none">{goal.emoji}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{goal.name}</p>
                  {goal.description && <p className="truncate text-sm text-muted-foreground">{goal.description}</p>}
                </div>
              </div>
              <form action={restoreGoal.bind(null, goal.id)}>
                <Button type="submit" variant="outline" size="sm">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
