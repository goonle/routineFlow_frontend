"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch, AuthError } from "@/lib/api";
import type { TaskCompletion } from "@/lib/types";

export async function completeTask(goalId: string, taskId: string): Promise<void> {
  try {
    await apiFetch<TaskCompletion>(`/api/tasks/${taskId}/completions`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

export async function undoTaskCompletion(goalId: string, taskId: string, date: string): Promise<void> {
  try {
    await apiFetch(`/api/tasks/${taskId}/completions/${date}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}
