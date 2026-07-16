"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import type { FormState, Task } from "@/lib/types";

const taskSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(2000).optional(),
  achieveAction: z.string().trim().min(1, "Achieve action is required").max(500),
});

function problemToState(err: ApiProblemError): FormState {
  const fieldErrors = "errors" in err.problem ? err.problem.errors : undefined;
  return { error: err.problem.title, fieldErrors };
}

export async function createTask(goalId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = taskSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    achieveAction: formData.get("achieveAction"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<Task>(`/api/goals/${goalId}/tasks`, { method: "POST", body: JSON.stringify(parsed.data) });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    if (err instanceof ApiProblemError) return problemToState(err);
    throw err;
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");
  return {};
}

export async function updateTask(
  goalId: string,
  taskId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = taskSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    achieveAction: formData.get("achieveAction"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<Task>(`/api/goals/${goalId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(parsed.data),
    });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    if (err instanceof ApiProblemError) return problemToState(err);
    throw err;
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");
  return {};
}

export async function deleteTask(goalId: string, taskId: string): Promise<void> {
  try {
    await apiFetch(`/api/goals/${goalId}/tasks/${taskId}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");
}
