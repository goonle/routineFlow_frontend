"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { FormError } from "@/components/ui/FormError";
import type { AuthActionState } from "@/lib/actions/auth";

type AuthAction = (prev: AuthActionState, formData: FormData) => Promise<AuthActionState>;

export function AuthForm({
  action,
  submitLabel,
  altLinkHref,
  altLinkLabel,
}: {
  action: AuthAction;
  submitLabel: string;
  altLinkHref: string;
  altLinkLabel: string;
}) {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(action, {});

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <FormError message={state.error} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldError messages={state.fieldErrors?.email} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
        <FieldError messages={state.fieldErrors?.password} />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Please wait…" : submitLabel}
      </Button>

      <Link href={altLinkHref} className="text-center text-sm text-muted-foreground hover:text-foreground hover:underline">
        {altLinkLabel}
      </Link>
    </form>
  );
}
