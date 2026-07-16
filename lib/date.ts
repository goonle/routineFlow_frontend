export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function mondayOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = Sun ... 6 = Sat
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diffToMonday);
}

export function mondayOfThisWeekIso(): string {
  return toIsoDate(mondayOfWeek(new Date()));
}
