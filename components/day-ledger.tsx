import React from "react";

type DayState = "kept" | "missed" | "today" | "future";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export interface DayLedgerProps {
  /** When the goal was created. */
  start: Date | string;
  /** When it has to be finished. */
  end: Date | string;
  /** Dates (yyyy-mm-dd) the user actually checked in. */
  checkedInDates: string[];
}

/**
 * The span of a goal, one cell per day. Elapsed days are spent whether or not
 * work happened — so the ledger shows time consumed, and which of those days
 * were kept. It doubles as the streak record.
 */
export function DayLedger({ start, end, checkedInDates }: DayLedgerProps) {
  const today = startOfDay(new Date());
  const first = startOfDay(new Date(start));
  const last = startOfDay(new Date(end));
  const kept = new Set(checkedInDates);

  const totalDays =
    Math.round((last.getTime() - first.getTime()) / 86400000) + 1;

  if (!Number.isFinite(totalDays) || totalDays < 1) return null;

  const span = Math.min(totalDays, 400);

  const days: { date: Date; state: DayState }[] = [];
  for (let i = 0; i < span; i++) {
    const date = new Date(first);
    date.setDate(first.getDate() + i);
    let state: DayState;
    if (date.getTime() === today.getTime()) state = "today";
    else if (date > today) state = "future";
    else state = kept.has(toKey(date)) ? "kept" : "missed";
    days.push({ date, state });
  }

  const size =
    span <= 14 ? "h-7 w-7" : span <= 45 ? "h-4 w-4" : span <= 120 ? "h-3 w-3" : "h-2 w-2";
  const gap = span <= 14 ? "gap-1.5" : span <= 45 ? "gap-1" : "gap-[3px]";

  const keptCount = days.filter((d) => d.state === "kept").length;
  const elapsed = days.filter((d) => d.state !== "future").length;

  const cellClass = (state: DayState) => {
    switch (state) {
      case "kept":
        return "bg-kept";
      case "today":
        return "bg-ink ring-2 ring-ink ring-offset-2 ring-offset-paper";
      case "missed":
        return "bg-rule";
      case "future":
        return "border border-rule";
    }
  };

  return (
    <div>
      <div
        className={`flex flex-wrap ${gap}`}
        role="img"
        aria-label={`${keptCount} of ${elapsed} days so far were kept. ${
          span - elapsed
        } days remain.`}
      >
        {days.map(({ date, state }, i) => (
          <span
            key={i}
            title={`${date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} — ${state === "today" ? "today" : state}`}
            className={`${size} rounded-[1px] ${cellClass(state)}`}
          />
        ))}
      </div>
      <p className="tnum mt-4 text-sm text-muted">
        {keptCount} of {elapsed} days kept
      </p>
    </div>
  );
}
