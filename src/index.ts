import { compareBs, getWeekday, isValidBs, type BsDate, type BsInput } from 'nepali-miti';
import { HOLIDAYS_2083 } from './data/2083';
import type { Holiday, HolidayScope, HolidayYear } from './types';

export type { Holiday, HolidayScope, HolidaySource, HolidayYear, LocalizedText } from './types';
export { TERAI_FAGU_DISTRICTS } from './data/2083';

export const ALL_SCOPES: readonly HolidayScope[] = [
  'national',
  'community',
  'region',
  'kathmandu-valley',
  'women',
  'education',
  'disability',
  'observance',
];

const years = new Map<number, HolidayYear>();

function load(): void {
  years.clear();
  years.set(HOLIDAYS_2083.year, HOLIDAYS_2083);
}
load();

export interface ScopeOptions {
  /** Which kinds of holiday to include. Default: every scope. */
  scopes?: readonly HolidayScope[];
}

function toBsDate(input: BsInput): BsDate {
  if (typeof input === 'string') {
    const m = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/.exec(
      input.replace(/[०-९]/g, (c) => String(c.charCodeAt(0) - 0x966)),
    );
    if (!m) throw new TypeError(`Expected a BS date like "2083-06-15", got "${input}"`);
    input = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  }
  if (!isValidBs(input.year, input.month, input.day)) {
    throw new RangeError(`Invalid BS date: ${input.year}-${input.month}-${input.day}`);
  }
  return { year: input.year, month: input.month, day: input.day };
}

function sameDay(a: BsDate, b: BsDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function inScope(holiday: Holiday, scopes: readonly HolidayScope[] | undefined): boolean {
  return !scopes || scopes.includes(holiday.scope);
}

function firstDateOrder(a: Holiday, b: Holiday): number {
  const da = a.dates[0];
  const db = b.dates[0];
  if (da && db) return compareBs(da, db);
  if (da) return -1;
  if (db) return 1;
  return 0;
}

/** BS years that have holiday data. */
export function getHolidayYears(): number[] {
  return [...years.keys()].sort((a, b) => a - b);
}

/** The full data set for a year (source, Saturday rule and holidays), or `undefined`. */
export function getHolidayYear(year: number): HolidayYear | undefined {
  return years.get(year);
}

/**
 * Holidays of a BS year, sorted by date. Holidays whose date is still to be announced come last
 * with an empty `dates` array. Throws `RangeError` if there is no data for the year.
 *
 * @example
 * getHolidays(2083, { scopes: ['national'] })
 */
export function getHolidays(year: number, options: ScopeOptions = {}): Holiday[] {
  const data = years.get(year);
  if (!data) {
    throw new RangeError(`No holiday data for BS ${year}. Available: ${getHolidayYears().join(', ') || 'none'}`);
  }
  return data.holidays.filter((h) => inScope(h, options.scopes)).sort(firstDateOrder);
}

/**
 * Holidays falling on a BS date (several can share a day, e.g. Buddha Jayanti and Labour Day).
 * Returns `[]` for days without holidays and for years without data.
 */
export function getHolidaysOn(date: BsInput, options: ScopeOptions = {}): Holiday[] {
  const day = toBsDate(date);
  const data = years.get(day.year);
  if (!data) return [];
  return data.holidays.filter((h) => inScope(h, options.scopes) && h.dates.some((x) => sameDay(x, day)));
}

export interface IsHolidayOptions {
  /** Which kinds of holiday count. Default `["national"]`: days off for everyone. */
  scopes?: readonly HolidayScope[];
  /** Count Saturdays (the weekly public holiday). Default `true`. */
  includeSaturdays?: boolean;
}

/**
 * `true` if the BS date is a day off: a Saturday (by default) or a holiday in the given scopes.
 *
 * Throws `RangeError` for a year without holiday data, so a missing year is never silently
 * reported as a working day.
 *
 * @example
 * isHoliday('2083-07-01') // true — Dashain
 * isHoliday('2083-05-29') // false — Teej is for women employees only
 * isHoliday('2083-05-29', { scopes: ['national', 'women'] }) // true
 */
export function isHoliday(date: BsInput, options: IsHolidayOptions = {}): boolean {
  const day = toBsDate(date);
  const data = years.get(day.year);
  if (!data) {
    throw new RangeError(`No holiday data for BS ${day.year}. Available: ${getHolidayYears().join(', ') || 'none'}`);
  }
  if ((options.includeSaturdays ?? true) && data.saturdaysOff && getWeekday(day) === 6) return true;
  const scopes = options.scopes ?? ['national'];
  return getHolidaysOn(day, { scopes }).some((h) => h.scope !== 'observance');
}

export interface UpcomingHoliday {
  date: BsDate;
  holiday: Holiday;
}

/**
 * Holiday days on or after `from`, in date order, one entry per day per holiday
 * (Dashain yields 7 entries). Holidays without an announced date are skipped.
 */
export function getUpcomingHolidays(from: BsInput, options: ScopeOptions & { limit?: number } = {}): UpcomingHoliday[] {
  const start = toBsDate(from);
  const out: UpcomingHoliday[] = [];
  for (const year of getHolidayYears()) {
    if (year < start.year) continue;
    for (const holiday of years.get(year)!.holidays) {
      if (!inScope(holiday, options.scopes)) continue;
      for (const date of holiday.dates) if (compareBs(date, start) >= 0) out.push({ date, holiday });
    }
  }
  out.sort((a, b) => compareBs(a.date, b.date));
  return options.limit === undefined ? out : out.slice(0, Math.max(0, options.limit));
}

/**
 * Fill in (or correct) the dates of a holiday, e.g. when the government announces the Eid date.
 * The change is global for the current JavaScript realm; `resetHolidayData()` undoes it.
 */
export function setHolidayDates(year: number, id: string, dates: readonly BsInput[]): void {
  const data = years.get(year);
  if (!data) throw new RangeError(`No holiday data for BS ${year}`);
  const index = data.holidays.findIndex((h) => h.id === id);
  if (index < 0) throw new RangeError(`No holiday "${id}" in BS ${year}`);
  const parsed = dates.map(toBsDate).sort(compareBs);
  if (parsed.some((x) => x.year !== year)) throw new RangeError(`All dates must be in BS ${year}`);
  const holidays = [...data.holidays];
  holidays[index] = { ...holidays[index]!, dates: parsed, dateStatus: parsed.length ? 'fixed' : 'to-be-announced' };
  years.set(year, { ...data, holidays });
}

/**
 * Add or replace a whole year of holiday data, e.g. when next year's notice is published before
 * this package is updated. Every date must be a valid BS date in that year.
 */
export function registerHolidayYear(data: HolidayYear): void {
  if (!Number.isInteger(data.year)) throw new TypeError('registerHolidayYear: year must be an integer');
  const ids = new Set<string>();
  for (const h of data.holidays) {
    if (ids.has(h.id)) throw new TypeError(`registerHolidayYear: duplicate id "${h.id}"`);
    ids.add(h.id);
    if (!ALL_SCOPES.includes(h.scope)) throw new TypeError(`registerHolidayYear: unknown scope "${h.scope}"`);
    for (const x of h.dates) {
      if (x.year !== data.year || !isValidBs(x.year, x.month, x.day)) {
        throw new RangeError(`registerHolidayYear: invalid date for "${h.id}": ${x.year}-${x.month}-${x.day}`);
      }
    }
  }
  years.set(data.year, data);
}

/** Restore the holiday data that ships with the package. */
export function resetHolidayData(): void {
  load();
}
