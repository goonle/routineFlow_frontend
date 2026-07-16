"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch, AuthError } from "@/lib/api";

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await apiFetch("/api/notifications/read-all", { method: "PUT" });
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }
  revalidatePath("/notifications");
}
