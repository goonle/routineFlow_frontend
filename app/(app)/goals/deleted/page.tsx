import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch, AuthError } from "@/lib/api";
import { restoreGoal } from "@/lib/actions/goals";
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
        <h1 className="text-2xl font-semibold">Deleted goals</h1>
        <Link href="/goals" className="text-sm text-blue-600 underline dark:text-blue-400">
          Back to goals
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        {goals.length === 0 && <p className="text-sm text-gray-500">No deleted goals.</p>}
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center justify-between rounded border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{goal.name}</span>
              {goal.description && <span className="text-sm text-gray-500">{goal.description}</span>}
            </div>
            <form action={restoreGoal.bind(null, goal.id)}>
              <button type="submit" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                Restore
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
