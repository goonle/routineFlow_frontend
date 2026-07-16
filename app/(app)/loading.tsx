export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
      <div className="flex flex-col gap-2">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
