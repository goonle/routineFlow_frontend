"use client";

import { useActionState } from "react";
import { EmotionLabels } from "@/lib/types";
import type { Emotion, FormState } from "@/lib/types";

type DailyReportAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export function DailyReportForm({
  action,
  initialEmotion,
  initialDiaryText = "",
}: {
  action: DailyReportAction;
  initialEmotion?: Emotion;
  initialDiaryText?: string;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex flex-col gap-1">
        <label htmlFor="emotion" className="text-sm font-medium">
          Emotion
        </label>
        <select
          id="emotion"
          name="emotion"
          defaultValue={initialEmotion ?? ""}
          className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        >
          <option value="">No emotion set</option>
          {Object.entries(EmotionLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.emotion?.map((m) => (
          <p key={m} className="text-sm text-red-600 dark:text-red-400">
            {m}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="diaryText" className="text-sm font-medium">
          Diary
        </label>
        <textarea
          id="diaryText"
          name="diaryText"
          defaultValue={initialDiaryText}
          rows={4}
          className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        {state.fieldErrors?.diaryText?.map((m) => (
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
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
