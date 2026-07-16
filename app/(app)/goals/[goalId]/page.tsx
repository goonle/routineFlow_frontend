import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import { updateGoal, deleteGoal } from "@/lib/actions/goals";
import { createTask, updateTask, deleteTask } from "@/lib/actions/tasks";
import { upsertPlan, deletePlan } from "@/lib/actions/plans";
import { completeTask, undoTaskCompletion } from "@/lib/actions/completions";
import { GoalForm } from "@/components/GoalForm";
import { TaskForm } from "@/components/TaskForm";
import { PlanForm } from "@/components/PlanForm";
import type { Goal, Task, Plan, TaskCompletion } from "@/lib/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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
    <div className="flex flex-col gap-10">
      <Link href="/goals" className="text-sm text-blue-600 underline dark:text-blue-400">
        Back to goals
      </Link>

      <section className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{goal.name}</h1>
            {goal.description && <p className="mt-1 text-gray-600 dark:text-gray-400">{goal.description}</p>}
          </div>
          <form action={deleteGoal.bind(null, goal.id)}>
            <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
              Delete goal
            </button>
          </form>
        </div>
        <details className="rounded border border-gray-200 p-4 dark:border-gray-800">
          <summary className="cursor-pointer text-sm font-medium">Edit goal</summary>
          <div className="mt-3 max-w-md">
            <GoalForm
              action={updateGoal.bind(null, goal.id)}
              initialName={goal.name}
              initialDescription={goal.description ?? ""}
              submitLabel="Save changes"
            />
          </div>
        </details>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Plan</h2>
        <div className="max-w-md rounded border border-gray-200 p-4 dark:border-gray-800">
          <PlanForm
            action={upsertPlan.bind(null, goal.id)}
            initialType={plan?.type}
            initialStartDate={plan?.startDate}
            initialEndDate={plan?.endDate}
            initialRepeatCount={plan?.repeatCount}
            submitLabel={plan ? "Update plan" : "Create plan"}
          />
        </div>
        {plan && (
          <form action={deletePlan.bind(null, goal.id)}>
            <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
              Delete plan
            </button>
          </form>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Tasks</h2>

        <div className="max-w-md rounded border border-gray-200 p-4 dark:border-gray-800">
          <h3 className="mb-3 text-sm font-medium">New task</h3>
          <TaskForm action={createTask.bind(null, goal.id)} submitLabel="Add task" resetOnSuccess />
        </div>

        <div className="flex flex-col gap-3">
          {tasksWithCounts.length === 0 && <p className="text-sm text-gray-500">No tasks yet.</p>}
          {tasksWithCounts.map(({ task, todayCount }) => (
            <div key={task.id} className="rounded border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{task.name}</p>
                  {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
                  <p className="text-xs text-gray-400">Achieve: {task.achieveAction}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <form action={undoTaskCompletion.bind(null, goal.id, task.id, today)}>
                      <button
                        type="submit"
                        disabled={todayCount === 0}
                        className="h-7 w-7 rounded border border-gray-300 disabled:opacity-30 dark:border-gray-700"
                        aria-label="Undo completion"
                      >
                        −
                      </button>
                    </form>
                    <span className="w-6 text-center text-sm">{todayCount}</span>
                    <form action={completeTask.bind(null, goal.id, task.id)}>
                      <button
                        type="submit"
                        className="h-7 w-7 rounded border border-gray-300 dark:border-gray-700"
                        aria-label="Mark done"
                      >
                        +
                      </button>
                    </form>
                  </div>
                  <form action={deleteTask.bind(null, goal.id, task.id)}>
                    <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-gray-500">Edit task</summary>
                <div className="mt-2 max-w-md">
                  <TaskForm
                    action={updateTask.bind(null, goal.id, task.id)}
                    initialName={task.name}
                    initialDescription={task.description ?? ""}
                    initialAchieveAction={task.achieveAction}
                    submitLabel="Save changes"
                  />
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
