import Link from "next/link";
import { redirect } from "next/navigation";
import { Archive, ChevronRight, ListTodo, Trash2 } from "lucide-react";
import { apiFetch, AuthError } from "@/lib/api";
import { createGoal, deleteGoal } from "@/lib/actions/goals";
import { GoalForm } from "@/components/GoalForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Goal } from "@/lib/types";

export default async function GoalsPage() {
  let goals: Goal[];
  try {
    goals = await apiFetch<Goal[]>("/api/goals");
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">Break your goals into tasks you can check off daily.</p>
        </div>
        <Link href="/goals/deleted">
          <Button variant="outline" size="sm">
            <Archive className="h-3.5 w-3.5" />
            Deleted
          </Button>
        </Link>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>New goal</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalForm action={createGoal} submitLabel="Create goal" resetOnSuccess />
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ListTodo className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">No goals yet — create one above.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {goals.map((goal) => (
            <Card key={goal.id} className="flex items-center justify-between gap-4 p-4">
              <Link href={`/goals/${goal.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                <span className="text-xl leading-none">{goal.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium group-hover:underline">{goal.name}</p>
                  {goal.description && <p className="truncate text-sm text-muted-foreground">{goal.description}</p>}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
              <form action={deleteGoal.bind(null, goal.id)}>
                <Button type="submit" variant="destructive" size="icon" aria-label="Delete goal">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
