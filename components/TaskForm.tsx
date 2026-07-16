"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/lib/types";

type TaskFormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export function TaskForm({
  action,
  initialName = "",
  initialDescription = "",
  initialAchieveAction = "",
  submitLabel = "Save",
  resetOnSuccess = false,
}: {
  action: TaskFormAction;
  initialName?: string;
  initialDescription?: string;
  initialAchieveAction?: string;
  submitLabel?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    const succeeded = wasPending.current && !isPending && !state.error && !state.fieldErrors;
    if (succeeded && resetOnSuccess) {
      formRef.current?.reset();
    }
    wasPending.current = isPending;
  }, [isPending, state, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={initialName}
          required
          className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        {state.fieldErrors?.name?.map((m) => (
          <p key={m} className="text-sm text-red-600 dark:text-red-400">
            {m}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialDescription}
          rows={2}
          className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        {state.fieldErrors?.description?.map((m) => (
          <p key={m} className="text-sm text-red-600 dark:text-red-400">
            {m}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="achieveAction" className="text-sm font-medium">
          Achieve action
        </label>
        <input
          id="achieveAction"
          name="achieveAction"
          defaultValue={initialAchieveAction}
          required
          placeholder="What counts as doing this task?"
          className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        {state.fieldErrors?.achieveAction?.map((m) => (
          <p key={m} className="text-sm text-red-600 dark:text-red-400">
            {m}
          </p>
        ))}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {isPending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
