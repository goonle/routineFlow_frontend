"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiFetch, AuthError, ApiProblemError } from "@/lib/api";
import type { DailyReport, FormState } from "@/lib/types";

const dailyReportSchema = z.object({
  emotion: z.coerce.number().int().min(0).max(7).optional(),
  diaryText: z.string().trim().max(5000).optional(),
});

function problemToState(err: ApiProblemError): FormState {
  const fieldErrors = "errors" in err.problem ? err.problem.errors : undefined;
  return { error: err.problem.title, fieldErrors };
}

export async function upsertDailyReport(date: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const emotionRaw = formData.get("emotion");
  const parsed = dailyReportSchema.safeParse({
    emotion: emotionRaw ? emotionRaw : undefined,
    diaryText: formData.get("diaryText") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await apiFetch<DailyReport>(`/api/daily-reports/${date}`, {
      method: "PUT",
      body: JSON.stringify(parsed.data),
    });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    if (err instanceof ApiProblemError) return problemToState(err);
    throw err;
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return {};
}
