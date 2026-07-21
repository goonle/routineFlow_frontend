"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import { GoalColor, GoalIcon } from "@/lib/types";
import type { FormState, Goal } from "@/lib/types";

const goalSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(2000).optional(),
  icon: z.coerce.number().int().min(0).max(19).default(GoalIcon.General),
  color: z.coerce.number().int().min(0).max(9).default(GoalColor.Red),
});

function problemToState(err: ApiProblemError): FormState {
  const fieldErrors = "errors" in err.problem ? err.problem.errors : undefined;
  return { error: err.problem.title, fieldErrors };
}

export async function createGoal(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<Goal>("/api/goals", { method: "POST", body: JSON.stringify(parsed.data) });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    if (err instanceof ApiProblemError) return problemToState(err);
    throw err;
  }

  revalidatePath("/goals");
  return {};
}

export async function updateGoal(goalId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<Goal>(`/api/goals/${goalId}`, { method: "PUT", body: JSON.stringify(parsed.data) });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    if (err instanceof ApiProblemError) return problemToState(err);
    throw err;
  }

  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  return {};
}

export async function deleteGoal(goalId: string): Promise<void> {
  try {
    await apiFetch(`/api/goals/${goalId}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }
  revalidatePath("/goals");
  revalidatePath("/goals/deleted");
  revalidatePath("/dashboard");
  redirect("/goals");
}

export async function restoreGoal(goalId: string): Promise<void> {
  try {
    await apiFetch(`/api/goals/${goalId}/restore`, { method: "POST" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }
  revalidatePath("/goals");
  revalidatePath("/goals/deleted");
  revalidatePath("/dashboard");
}
