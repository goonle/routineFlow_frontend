"use client";

import { useActionState } from "react";
import Link from "next/link";
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
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      {state.error && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        {state.fieldErrors?.email?.map((msg) => (
          <p key={msg} className="text-sm text-red-600 dark:text-red-400">
            {msg}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        {state.fieldErrors?.password?.map((msg) => (
          <p key={msg} className="text-sm text-red-600 dark:text-red-400">
            {msg}
          </p>
        ))}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {isPending ? "Please wait…" : submitLabel}
      </button>

      <Link href={altLinkHref} className="text-sm text-blue-600 underline dark:text-blue-400">
        {altLinkLabel}
      </Link>
    </form>
  );
}
