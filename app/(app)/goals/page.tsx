import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch, AuthError } from "@/lib/api";
import { createGoal, deleteGoal } from "@/lib/actions/goals";
import { GoalForm } from "@/components/GoalForm";
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
        <h1 className="text-2xl font-semibold">Goals</h1>
        <Link href="/goals/deleted" className="text-sm text-blue-600 underline dark:text-blue-400">
          View deleted goals
        </Link>
      </div>

      <section className="max-w-md rounded border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="mb-3 text-lg font-medium">New goal</h2>
        <GoalForm action={createGoal} submitLabel="Create goal" resetOnSuccess />
      </section>

      <section className="flex flex-col gap-3">
        {goals.length === 0 && <p className="text-sm text-gray-500">No goals yet — create one above.</p>}
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center justify-between rounded border border-gray-200 p-4 dark:border-gray-800"
          >
            <Link href={`/goals/${goal.id}`} className="flex flex-col gap-1">
              <span className="font-medium hover:underline">{goal.name}</span>
              {goal.description && <span className="text-sm text-gray-500">{goal.description}</span>}
            </Link>
            <form action={deleteGoal.bind(null, goal.id)}>
              <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
                Delete
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
