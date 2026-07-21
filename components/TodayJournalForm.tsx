"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { FormError } from "@/components/ui/FormError";
import { FieldError } from "@/components/ui/FieldError";
import { Emotion, EmotionLabels } from "@/lib/types";
import type { FormState } from "@/lib/types";

type JournalAction = (prev: FormState, formData: FormData) => Promise<FormState>;

const EMOTION_ORDER: Emotion[] = [
  Emotion.Excited,
  Emotion.Happy,
  Emotion.Calm,
  Emotion.Neutral,
  Emotion.Tired,
  Emotion.Sad,
  Emotion.Anxious,
  Emotion.Angry,
];

const EMOTION_EMOJIS: Record<Emotion, string> = {
  [Emotion.Excited]: "🤩",
  [Emotion.Happy]: "😊",
  [Emotion.Calm]: "😌",
  [Emotion.Neutral]: "😐",
  [Emotion.Tired]: "😪",
  [Emotion.Sad]: "😢",
  [Emotion.Anxious]: "😰",
  [Emotion.Angry]: "😠",
};

export function TodayJournalForm({
  action,
  initialEmotion,
  initialDiaryText = "",
}: {
  action: JournalAction;
  initialEmotion?: Emotion;
  initialDiaryText?: string;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />

      <div className="flex flex-col gap-2">
        <Label>How are you feeling today?</Label>
        <div className="flex flex-wrap gap-2">
          {EMOTION_ORDER.map((emotion) => (
            <label key={emotion} className="cursor-pointer">
              <input type="radio" name="emotion" value={emotion} defaultChecked={initialEmotion === emotion} className="peer sr-only" />
              <span className="flex w-16 flex-col items-center gap-1 rounded-lg border border-border bg-background py-2 text-xs text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-accent peer-checked:text-accent-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                <span className="text-xl leading-none">{EMOTION_EMOJIS[emotion]}</span>
                {EmotionLabels[emotion]}
              </span>
            </label>
          ))}
        </div>
        <FieldError messages={state.fieldErrors?.emotion} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="diaryText">Daily notes</Label>
        <Textarea
          id="diaryText"
          name="diaryText"
          defaultValue={initialDiaryText}
          rows={6}
          placeholder="How was your day? Write anything you'd like..."
        />
        <FieldError messages={state.fieldErrors?.diaryText} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save journal"}
      </Button>
    </form>
  );
}
