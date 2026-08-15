import { NOT_PUBLISHED } from "@/lib/copy";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDeadline(iso: string | null): string {
  if (!iso) return NOT_PUBLISHED;
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return NOT_PUBLISHED;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function formatInstrument(instrument: string): string {
  return instrument.replaceAll("_", " ");
}
