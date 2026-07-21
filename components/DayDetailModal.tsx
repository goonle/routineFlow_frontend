"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { DailyReportForm } from "@/components/DailyReportForm";
import type { Emotion, FormState, Goal, Task } from "@/lib/types";

type ReportAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export interface CompletedGoalActions {
  goal: Goal;
  tasks: Task[];
}

export function DayDetailModal({
  open,
  closeHref,
  dateLabel,
  emotionEmoji,
  emotionLabel,
  diaryText,
  completedGoals,
  reportAction,
  initialEmotion,
}: {
  open: boolean;
  closeHref: string;
  dateLabel: string;
  emotionEmoji?: string;
  emotionLabel?: string;
  diaryText?: string;
  completedGoals: CompletedGoalActions[];
  reportAction: ReportAction;
  initialEmotion?: Emotion;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const close = () => router.push(closeHref);

  return (
    <Modal
      open={open}
      onCloseAction={close}
      title={
        <div>
          <p>{dateLabel}</p>
          {emotionEmoji && (
            <p className="mt-0.5 text-sm font-normal text-muted-foreground">
              {emotionEmoji} {emotionLabel}
            </p>
          )}
        </div>
      }
      actions={
        !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit journal"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )
      }
    >
      {isEditing ? (
        <DailyReportForm action={reportAction} initialEmotion={initialEmotion} initialDiaryText={diaryText ?? ""} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completed actions</h3>
            {completedGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No actions completed this day.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {completedGoals.map(({ goal, tasks }) => (
                  <div key={goal.id} className="rounded-lg bg-muted/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{goal.emoji}</span>
                      <span className="text-sm font-medium">{goal.name}</span>
                    </div>
                    <div className="mt-1.5 flex flex-col gap-1 pl-6">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: goal.colorHex }} />
                          {task.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Daily notes</h3>
            <p className="min-h-16 whitespace-pre-wrap rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
              {diaryText || <span className="text-muted-foreground">No notes yet.</span>}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
