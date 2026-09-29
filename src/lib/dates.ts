// Dates are plain YYYY-MM-DD strings in the user's local time zone.

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = parse(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function weekday(iso: string): string {
  return parse(iso).toLocaleDateString("en-US", { weekday: "long" });
}

export function longDate(iso: string): string {
  return parse(iso).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function dayOfYear(iso: string): number {
  const d = parse(iso);
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.round((d.getTime() - start.getTime()) / 86_400_000) + 1;
}
