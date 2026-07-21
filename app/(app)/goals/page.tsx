import Link from "next/link";
import { redirect } from "next/navigation";
import { Archive, ListTodo } from "lucide-react";
import { apiFetch, AuthError } from "@/lib/api";
import { createGoal, updateGoal, deleteGoal } from "@/lib/actions/goals";
import { createTask, updateTask, deleteTask } from "@/lib/actions/tasks";
import { AddGoalButton } from "@/components/AddGoalButton";
import { GoalCard } from "@/components/GoalCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Goal, Task } from "@/lib/types";

const MAX_GOALS = 10;
const MAX_TASKS_PER_GOAL = 10;

export default async function GoalsPage() {
  let goals: Goal[];
  try {
    goals = await apiFetch<Goal[]>("/api/goals");
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  const goalsWithTasks: { goal: Goal; tasks: Task[] }[] = [];
  for (const goal of goals) {
    let tasks: Task[];
    try {
      tasks = await apiFetch<Task[]>(`/api/goals/${goal.id}/tasks`);
    } catch (err) {
      if (err instanceof AuthError) redirect("/login");
      throw err;
    }
    goalsWithTasks.push({ goal, tasks });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">
            {goals.length}/{MAX_GOALS} goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/goals/deleted">
            <Button variant="outline" size="sm">
              <Archive className="h-3.5 w-3.5" />
              Deleted
            </Button>
          </Link>
          <AddGoalButton action={createGoal} disabled={goals.length >= MAX_GOALS} />
        </div>
      </div>

      {goalsWithTasks.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ListTodo className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">No goals yet — add one to get started.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {goalsWithTasks.map(({ goal, tasks }) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              maxTasks={MAX_TASKS_PER_GOAL}
              tasks={tasks.map((task) => ({
                task,
                onUpdateAction: updateTask.bind(null, goal.id, task.id),
                onDeleteAction: deleteTask.bind(null, goal.id, task.id),
              }))}
              onUpdateGoalAction={updateGoal.bind(null, goal.id)}
              onDeleteGoalAction={deleteGoal.bind(null, goal.id)}
              onCreateTaskAction={createTask.bind(null, goal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
