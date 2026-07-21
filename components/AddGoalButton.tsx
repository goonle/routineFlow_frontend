"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { GoalForm } from "@/components/GoalForm";
import type { FormState } from "@/lib/types";

type GoalFormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export function AddGoalButton({ action, disabled }: { action: GoalFormAction; disabled?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" disabled={disabled} onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Add Goal
      </Button>

      <Modal open={open} onCloseAction={() => setOpen(false)} title="Add New Goal">
        <GoalForm action={action} submitLabel="Save" onSuccessAction={() => setOpen(false)} onCancelAction={() => setOpen(false)} />
      </Modal>
    </>
  );
}
