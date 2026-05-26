import { DateTime } from "luxon";

export const EVENT_TIMEZONE = "America/Edmonton";

export function eventInputToUtcIso(value: string) {
  return DateTime.fromISO(value, { zone: EVENT_TIMEZONE }).toUTC().toISO();
}

export function eventDateToInputValue(value: string) {
  return DateTime.fromISO(value, { zone: "utc" })
    .setZone(EVENT_TIMEZONE)
    .toFormat("yyyy-MM-dd'T'HH:mm");
}

export function formatEventDate(value: string) {
  return DateTime.fromISO(value, { zone: "utc" })
    .setZone(EVENT_TIMEZONE)
    .toFormat("ccc, LLL d, yyyy • h:mm a");
}