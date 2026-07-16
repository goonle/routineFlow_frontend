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

// Parses a "YYYY-MM-DD" string as a local date, avoiding the UTC-midnight
// shift that `new Date("YYYY-MM-DD")` introduces in negative-UTC-offset zones.
export function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Monday=0 ... Sunday=6
export function mondayIndex(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}
