"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { apiFetch, ApiProblemError } from "@/lib/api";
import { setSessionCookies, getRefreshToken, clearSessionCookies } from "@/lib/session";
import type { AuthTokens, FormState } from "@/lib/types";

const credentialsSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthActionState = FormState;

export async function login(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let tokens: AuthTokens;
  try {
    tokens = await apiFetch<AuthTokens>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(parsed.data),
      skipAuth: true,
    });
  } catch (err) {
    if (err instanceof ApiProblemError) {
      return { error: err.status === 401 ? "Invalid email or password" : err.problem.title };
    }
    throw err;
  }

  await setSessionCookies(tokens);
  redirect("/dashboard");
}

export async function register(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let tokens: AuthTokens;
  try {
    tokens = await apiFetch<AuthTokens>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(parsed.data),
      skipAuth: true,
    });
  } catch (err) {
    if (err instanceof ApiProblemError) {
      const fieldErrors = "errors" in err.problem ? err.problem.errors : undefined;
      return { error: err.problem.title, fieldErrors };
    }
    throw err;
  }

  await setSessionCookies(tokens);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Best-effort — log out client-side regardless of backend result.
    }
  }
  await clearSessionCookies();
  redirect("/login");
}
