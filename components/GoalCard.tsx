"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { GoalForm } from "@/components/GoalForm";
import { TaskForm } from "@/components/TaskForm";
import type { FormState, Goal, Task } from "@/lib/types";

type GoalFormAction = (prev: FormState, formData: FormData) => Promise<FormState>;
type TaskFormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

interface TaskWithActions {
  task: Task;
  onUpdateAction: TaskFormAction;
  onDeleteAction: () => Promise<void>;
}

export function GoalCard({
  goal,
  tasks,
  maxTasks,
  onUpdateGoalAction,
  onDeleteGoalAction,
  onCreateTaskAction,
}: {
  goal: Goal;
  tasks: TaskWithActions[];
  maxTasks: number;
  onUpdateGoalAction: GoalFormAction;
  onDeleteGoalAction: () => Promise<void>;
  onCreateTaskAction: TaskFormAction;
}) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const editingTask = tasks.find(({ task }) => task.id === editingTaskId);

  return (
    <Card className="overflow-hidden p-0" style={{ borderLeft: `4px solid ${goal.colorHex}` }}>
      <div className="flex items-center justify-between gap-4 p-4">
        <Link href={`/goals/${goal.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg leading-none"
            style={{ backgroundColor: `${goal.colorHex}1f` }}
          >
            {goal.emoji}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold group-hover:underline">{goal.name}</p>
            {goal.description && <p className="truncate text-sm text-muted-foreground">{goal.description}</p>}
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="icon" aria-label="Edit goal" onClick={() => setEditingGoal(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <form action={onDeleteGoalAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Delete goal"
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="flex flex-col gap-2 px-4 pb-2">
          {tasks.map(({ task, onDeleteAction }) => (
            <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: goal.colorHex }} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.name}</p>
                  <p className="truncate text-xs text-muted-foreground">Done: {task.achieveAction}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Edit task"
                  onClick={() => setEditingTaskId(task.id)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <form action={onDeleteAction}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label="Delete task"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => setAddingTask(true)}
          disabled={tasks.length >= maxTasks}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Action ({tasks.length}/{maxTasks})
        </button>
      </div>

      <Modal open={editingGoal} onCloseAction={() => setEditingGoal(false)} title="Edit Goal">
        <GoalForm
          action={onUpdateGoalAction}
          initialName={goal.name}
          initialDescription={goal.description ?? ""}
          initialIcon={goal.icon}
          initialColor={goal.color}
          submitLabel="Save"
          onSuccessAction={() => setEditingGoal(false)}
          onCancelAction={() => setEditingGoal(false)}
        />
      </Modal>

      <Modal open={addingTask} onCloseAction={() => setAddingTask(false)} title="Add Action">
        <TaskForm
          action={onCreateTaskAction}
          submitLabel="Save"
          onSuccessAction={() => setAddingTask(false)}
          onCancelAction={() => setAddingTask(false)}
        />
      </Modal>

      <Modal open={editingTaskId !== null} onCloseAction={() => setEditingTaskId(null)} title="Edit Action">
        {editingTask && (
          <TaskForm
            action={editingTask.onUpdateAction}
            initialName={editingTask.task.name}
            initialDescription={editingTask.task.description ?? ""}
            initialAchieveAction={editingTask.task.achieveAction}
            submitLabel="Save"
            onSuccessAction={() => setEditingTaskId(null)}
            onCancelAction={() => setEditingTaskId(null)}
          />
        )}
      </Modal>
    </Card>
  );
}
