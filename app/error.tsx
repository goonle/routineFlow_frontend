"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-gray-500">{error.message || "An unexpected error occurred."}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white dark:bg-gray-100 dark:text-gray-900"
      >
        Try again
      </button>
    </div>
  );
}
