import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import { updateGoal, deleteGoal } from "@/lib/actions/goals";
import { createTask, updateTask, deleteTask } from "@/lib/actions/tasks";
import { upsertPlan, deletePlan } from "@/lib/actions/plans";
import { completeTask, undoTaskCompletion } from "@/lib/actions/completions";
import { GoalForm } from "@/components/GoalForm";
import { TaskForm } from "@/components/TaskForm";
import { PlanForm } from "@/components/PlanForm";
import { CompletionStepper } from "@/components/CompletionStepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { todayIso } from "@/lib/date";
import type { Goal, Task, Plan, TaskCompletion } from "@/lib/types";

export default async function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;

  let goal: Goal;
  try {
    goal = await apiFetch<Goal>(`/api/goals/${goalId}`);
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    if (err instanceof ApiProblemError && err.status === 404) notFound();
    throw err;
  }

  let tasks: Task[];
  try {
    tasks = await apiFetch<Task[]>(`/api/goals/${goalId}/tasks`);
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  let plan: Plan | null;
  try {
    plan = await apiFetch<Plan>(`/api/goals/${goalId}/plan`);
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    if (err instanceof ApiProblemError && err.status === 404) {
      plan = null;
    } else {
      throw err;
    }
  }

  const today = todayIso();
  const tasksWithCounts: { task: Task; todayCount: number }[] = [];
  for (const task of tasks) {
    try {
      const completions = await apiFetch<TaskCompletion[]>(
        `/api/tasks/${task.id}/completions?from=${today}&to=${today}`
      );
      tasksWithCounts.push({ task, todayCount: completions[0]?.count ?? 0 });
    } catch (err) {
      if (err instanceof AuthError) redirect("/login");
      throw err;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Link href="/goals" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to goals
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">{goal.emoji}</span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{goal.name}</h1>
                {goal.description && <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>}
              </div>
            </div>
            <form action={deleteGoal.bind(null, goal.id)}>
              <Button type="submit" variant="destructive" size="sm">
                <Trash2 className="h-3.5 w-3.5" />
                Delete goal
              </Button>
            </form>
          </div>
          <details className="group">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
              <Pencil className="h-3.5 w-3.5" />
              Edit goal
            </summary>
            <div className="mt-4 max-w-md border-t border-border pt-4">
              <GoalForm
                action={updateGoal.bind(null, goal.id)}
                initialName={goal.name}
                initialDescription={goal.description ?? ""}
                initialIcon={goal.icon}
                submitLabel="Save changes"
              />
            </div>
          </details>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Plan</h2>
        <Card className="max-w-md">
          <CardContent className="flex flex-col gap-4 p-5">
            <PlanForm
              action={upsertPlan.bind(null, goal.id)}
              initialType={plan?.type}
              initialStartDate={plan?.startDate}
              initialEndDate={plan?.endDate}
              initialRepeatCount={plan?.repeatCount}
              submitLabel={plan ? "Update plan" : "Create plan"}
            />
            {plan && (
              <form action={deletePlan.bind(null, goal.id)} className="border-t border-border pt-4">
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete plan
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Tasks</h2>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>New task</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm action={createTask.bind(null, goal.id)} submitLabel="Add task" resetOnSuccess />
          </CardContent>
        </Card>

        {tasksWithCounts.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <ClipboardList className="h-5 w-5" />
            </span>
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {tasksWithCounts.map(({ task, todayCount }) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{task.name}</p>
                    {task.description && <p className="truncate text-sm text-muted-foreground">{task.description}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">Achieve: {task.achieveAction}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CompletionStepper
                      count={todayCount}
                      onIncrementAction={completeTask.bind(null, goal.id, task.id)}
                      onDecrementAction={undoTaskCompletion.bind(null, goal.id, task.id, today)}
                    />
                    <form action={deleteTask.bind(null, goal.id, task.id)}>
                      <Button type="submit" variant="destructive" size="icon" aria-label="Delete task">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
                <details className="group mt-3">
                  <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                    Edit task
                  </summary>
                  <div className="mt-3 max-w-md border-t border-border pt-3">
                    <TaskForm
                      action={updateTask.bind(null, goal.id, task.id)}
                      initialName={task.name}
                      initialDescription={task.description ?? ""}
                      initialAchieveAction={task.achieveAction}
                      submitLabel="Save changes"
                    />
                  </div>
                </details>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
