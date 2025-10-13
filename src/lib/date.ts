// src/lib/date.ts
// Minimal date helpers for a mobile month grid, using local time with
// explicit America/Chicago formatting for display and grouping.

const CHICAGO_TZ = "America/Chicago";

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date): Date {
  // Weeks start on Sunday
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function formatDateTimeChicago(date: Date): string {
  return date.toLocaleString("en-US", {
    timeZone: CHICAGO_TZ,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDateKeyChicago(date: Date): string {
  // YYYY-MM-DD key derived in Chicago timezone
  const s = date.toLocaleDateString("en-CA", { timeZone: CHICAGO_TZ });
  // en-CA gives YYYY-MM-DD
  return s;
}

export function buildMonthMatrix(baseDate: Date): Date[] {
  // Returns a list of 42 dates (6 weeks * 7 days) covering the month view
  const firstOfMonth = startOfMonth(baseDate);
  const lastOfMonth = endOfMonth(baseDate);
  const firstVisible = startOfWeek(firstOfMonth);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(firstVisible, i));
  }
  // Ensure the last cell covers at least through endOfMonth's week
  const lastVisible = days[days.length - 1];
  if (lastVisible < lastOfMonth) {
    const extra = 7;
    for (let i = 0; i < extra; i++) days.push(addDays(lastVisible, i + 1));
  }
  return days.slice(0, 42);
}
