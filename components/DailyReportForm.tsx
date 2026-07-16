"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { FormError } from "@/components/ui/FormError";
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
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="emotion">Emotion</Label>
        <Select id="emotion" name="emotion" defaultValue={initialEmotion ?? ""}>
          <option value="">No emotion set</option>
          {Object.entries(EmotionLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <FieldError messages={state.fieldErrors?.emotion} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="diaryText">Diary</Label>
        <Textarea id="diaryText" name="diaryText" defaultValue={initialDiaryText} rows={4} />
        <FieldError messages={state.fieldErrors?.diaryText} />
      </div>

      <Button type="submit" disabled={isPending} size="sm" className="self-start">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
