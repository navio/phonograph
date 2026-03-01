import type { IntlShape } from "react-intl";

type RelativeTimeUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

interface TimeUnitConfig {
  unit: RelativeTimeUnit;
  ms: number;
}

const TIME_UNITS: TimeUnitConfig[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
];

/**
 * Format a date as a relative time string using Intl.RelativeTimeFormat.
 * Returns a string like "3 days ago" or "in 2 hours".
 *
 * @param intl - The intl object from useIntl()
 * @param date - The date to format (Date object, timestamp, or ISO string)
 * @param excludeSuffix - If true, returns just "3 days" instead of "3 days ago"
 */
export function formatRelativeTime(
  intl: IntlShape,
  date: Date | number | string,
  excludeSuffix = false
): string {
  const targetDate = typeof date === "object" ? date : new Date(date);
  const now = Date.now();
  const diffMs = targetDate.getTime() - now;
  const absDiff = Math.abs(diffMs);

  // Find the appropriate unit
  for (const { unit, ms } of TIME_UNITS) {
    if (absDiff >= ms || unit === "second") {
      const value = Math.round(diffMs / ms);

      if (excludeSuffix) {
        // Return just the number and unit without "ago" / "in"
        // We format with value=0 style then replace
        return intl.formatRelativeTime(Math.abs(value), unit, { style: "long", numeric: "always" })
          .replace(/^in /, "")
          .replace(/ ago$/, "");
      }

      return intl.formatRelativeTime(value, unit, { style: "long", numeric: "auto" });
    }
  }

  // Fallback
  return intl.formatRelativeTime(0, "second", { style: "long", numeric: "auto" });
}

/**
 * Hook-friendly version: just returns formatted relative time string.
 * For use in components that already have access to intl.
 */
export function getRelativeTimeString(
  intl: IntlShape,
  date: Date | number | string,
  excludeSuffix = false
): string {
  return formatRelativeTime(intl, date, excludeSuffix);
}
