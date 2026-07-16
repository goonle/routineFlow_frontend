"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import { PlanType } from "@/lib/types";
import type { FormState, Plan } from "@/lib/types";

const planSchema = z
  .object({
    type: z.coerce.number().int(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    repeatCount: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (![PlanType.Weekly, PlanType.Monthly, PlanType.Custom].includes(data.type as PlanType)) {
      ctx.addIssue({ code: "custom", message: "Invalid plan type", path: ["type"] });
      return;
    }
    if (data.type === PlanType.Custom) {
      if (!data.startDate) {
        ctx.addIssue({ code: "custom", message: "Start date is required for custom plans", path: ["startDate"] });
      }
      if (!data.endDate) {
        ctx.addIssue({ code: "custom", message: "End date is required for custom plans", path: ["endDate"] });
      }
      if (data.startDate && data.endDate && data.endDate < data.startDate) {
        ctx.addIssue({ code: "custom", message: "End date must be on or after start date", path: ["endDate"] });
      }
    }
  });

function problemToState(err: ApiProblemError): FormState {
  const fieldErrors = "errors" in err.problem ? err.problem.errors : undefined;
  return { error: err.problem.title, fieldErrors };
}

export async function upsertPlan(goalId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = planSchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    repeatCount: formData.get("repeatCount") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Strip dates unless Custom, regardless of stale client state — mirrors the
  // backend's own rejection of dates on Weekly/Monthly plans.
  const isCustom = parsed.data.type === PlanType.Custom;
  const payload = {
    type: parsed.data.type,
    startDate: isCustom ? parsed.data.startDate : undefined,
    endDate: isCustom ? parsed.data.endDate : undefined,
    repeatCount: parsed.data.repeatCount,
  };

  try {
    await apiFetch<Plan>(`/api/goals/${goalId}/plan`, { method: "PUT", body: JSON.stringify(payload) });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    if (err instanceof ApiProblemError) return problemToState(err);
    throw err;
  }

  revalidatePath(`/goals/${goalId}`);
  return {};
}

export async function deletePlan(goalId: string): Promise<void> {
  try {
    await apiFetch(`/api/goals/${goalId}/plan`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  revalidatePath(`/goals/${goalId}`);
}
