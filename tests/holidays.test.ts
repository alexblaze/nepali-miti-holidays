import { getWeekday, toAd } from 'nepali-miti';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ALL_SCOPES,
  getHolidayYear,
  getHolidayYears,
  getHolidays,
  getHolidaysOn,
  getUpcomingHolidays,
  isHoliday,
  registerHolidayYear,
  resetHolidayData,
  setHolidayDates,
  TERAI_FAGU_DISTRICTS,
  type HolidayYear,
} from '../src';

afterEach(() => resetHolidayData());

const iso = (d: { year: number; month: number; day: number }): string =>
  `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

// Weekday printed next to each date in the Nepal Gazette notice (0 = Sunday … 6 = Saturday).
// For multi-day holidays the gazette gives the first and last day.
const GAZETTE_WEEKDAYS: Record<string, number[]> = {
  'new-year': [2],
  'chandi-purnima': [5],
  'raksha-bandhan': [5],
  'krishna-janmashtami': [5],
  ghatasthapana: [0],
  dashain: [6, 5],
  tihar: [0, 4],
  chhath: [0],
  'dhanya-purnima': [4],
  christmas: [5],
  'tamu-lhosar': [3],
  'maghe-sankranti': [5],
  'sonam-lhosar': [0],
  'maha-shivaratri': [6],
  'gyalpo-lhosar': [2],
  'fagu-purnima-hill': [0],
  'fagu-purnima-terai': [1],
  'gai-jatra': [6],
  'gaura-parva': [5],
  'dura-mhaipru-nakuma': [3],
  teej: [1],
  jitiya: [0],
  'basanta-panchami': [4],
  'gai-jatra-kathmandu': [6],
  'indra-jatra': [5],
  'ghode-jatra': [2],
  'labour-day': [5],
  'republic-day': [5],
  'constitution-day': [6],
  'martyrs-day': [6],
  'democracy-day': [5],
  'womens-day': [1],
  'disability-day': [4],
  'buddha-jayanti': [5],
  'prithvi-jayanti': [1],
  'falgunanda-jayanti': [3],
  'caste-discrimination-elimination-day': [4],
  'civil-service-day': [1],
  'gen-z-martyrs-day': [2],
};

describe('BS 2083 data', () => {
  const holidays = getHolidays(2083);

  it('has unique ids and known scopes', () => {
    expect(new Set(holidays.map((h) => h.id)).size).toBe(holidays.length);
    expect(holidays.every((h) => ALL_SCOPES.includes(h.scope))).toBe(true);
  });

  it('matches the weekday printed in the gazette for every fixed date', () => {
    const fixed = holidays.filter((h) => h.dateStatus === 'fixed');
    expect(fixed.map((h) => h.id).sort()).toEqual(Object.keys(GAZETTE_WEEKDAYS).sort());
    for (const h of fixed) {
      const expected = GAZETTE_WEEKDAYS[h.id]!;
      const first = getWeekday(h.dates[0]!);
      const last = getWeekday(h.dates[h.dates.length - 1]!);
      expect(expected.length === 1 ? [first] : [first, last], h.id).toEqual(expected);
    }
  });

  it('places Gregorian-fixed holidays on their Gregorian dates', () => {
    const byId = (id: string) => iso(toAd(holidays.find((h) => h.id === id)!.dates[0]!));
    expect(byId('christmas')).toBe('2026-12-25');
    expect(byId('labour-day')).toBe('2026-05-01');
    expect(byId('disability-day')).toBe('2026-12-03');
    expect(byId('womens-day')).toBe('2027-03-08');
    expect(byId('new-year')).toBe('2026-04-14');
  });

  it('expands Dashain (7 days, across Asoj 31) and Tihar (5 days)', () => {
    const dashain = holidays.find((h) => h.id === 'dashain')!;
    expect(dashain.dates.map(iso)).toEqual([
      '2083-06-31',
      '2083-07-01',
      '2083-07-02',
      '2083-07-03',
      '2083-07-04',
      '2083-07-05',
      '2083-07-06',
    ]);
    expect(iso(toAd(dashain.dates[0]!))).toBe('2026-10-17');
    expect(holidays.find((h) => h.id === 'tihar')!.dates).toHaveLength(5);
  });

  it('lists holidays without an announced date last', () => {
    const tba = holidays.filter((h) => h.dateStatus === 'to-be-announced').map((h) => h.id);
    expect(tba.sort()).toEqual(
      ['bhoto-jatra', 'eid-al-adha', 'eid-al-fitr', 'guru-nanak-jayanti', 'mohammad-jayanti', 'sirua-pawani'].sort(),
    );
    expect(holidays.slice(-tba.length).every((h) => h.dates.length === 0)).toBe(true);
    for (let i = 1; i < holidays.length - tba.length; i++) {
      expect(iso(holidays[i - 1]!.dates[0]!) <= iso(holidays[i]!.dates[0]!)).toBe(true);
    }
  });

  it('records 21 Terai districts for Fagu Purnima and cites its source', () => {
    expect(TERAI_FAGU_DISTRICTS).toHaveLength(21);
    expect(getHolidayYear(2083)!.source.published).toBe('2082-11-18');
    expect(getHolidayYears()).toEqual([2083]);
  });
});

describe('getHolidays', () => {
  it('filters by scope', () => {
    const women = getHolidays(2083, { scopes: ['women'] }).map((h) => h.id);
    expect(women).toEqual(['teej', 'jitiya']);
    expect(getHolidays(2083, { scopes: ['observance'] })).toHaveLength(3);
  });
  it('throws for years without data', () => {
    expect(() => getHolidays(2090)).toThrow(/No holiday data for BS 2090/);
  });
});

describe('getHolidaysOn', () => {
  it('returns every holiday on a shared day', () => {
    expect(getHolidaysOn('2083-01-18').map((h) => h.id)).toEqual(['chandi-purnima', 'labour-day', 'buddha-jayanti']);
    expect(getHolidaysOn({ year: 2083, month: 5, day: 13 }, { scopes: ['kathmandu-valley'] }).map((h) => h.id)).toEqual(
      ['gai-jatra-kathmandu'],
    );
  });
  it('accepts Devanagari digits and returns [] for ordinary days and other years', () => {
    expect(getHolidaysOn('२०८३-०७-०१').map((h) => h.id)).toEqual(['dashain']);
    expect(getHolidaysOn('2083-06-15')).toEqual([]);
    expect(getHolidaysOn('2084-01-01')).toEqual([]);
  });
  it('validates input', () => {
    expect(() => getHolidaysOn('2083-06-32')).toThrow(RangeError);
    expect(() => getHolidaysOn('15 Asoj')).toThrow(TypeError);
  });
});

describe('isHoliday', () => {
  it('counts Saturdays and national holidays by default', () => {
    expect(isHoliday('2083-06-17')).toBe(true); // Saturday
    expect(isHoliday('2083-06-17', { includeSaturdays: false })).toBe(false);
    expect(isHoliday('2083-07-01')).toBe(true); // Dashain, Sunday
    expect(isHoliday('2083-06-15')).toBe(false); // ordinary Thursday
  });
  it('ignores narrower scopes unless asked', () => {
    expect(isHoliday('2083-05-29')).toBe(false); // Teej: women employees only
    expect(isHoliday('2083-05-29', { scopes: ['national', 'women'] })).toBe(true);
    expect(isHoliday('2083-06-09', { scopes: ['kathmandu-valley'] })).toBe(true); // Indra Jatra
  });
  it('never treats an "offices open" observance as a day off', () => {
    expect(isHoliday('2083-05-22', { scopes: [...ALL_SCOPES] })).toBe(false); // Civil Service Day, Monday
  });
  it('throws instead of guessing for years without data', () => {
    expect(() => isHoliday('2084-01-02')).toThrow(/No holiday data/);
  });
});

describe('getUpcomingHolidays', () => {
  it('lists holiday days from a date in order', () => {
    const next = getUpcomingHolidays('2083-06-15', { scopes: ['national'], limit: 3 });
    expect(next.map((x) => `${iso(x.date)} ${x.holiday.id}`)).toEqual([
      '2083-06-25 ghatasthapana',
      '2083-06-31 dashain',
      '2083-07-01 dashain',
    ]);
    expect(getUpcomingHolidays('2083-12-24')).toEqual([]);
    expect(getUpcomingHolidays('2083-01-01', { limit: -1 })).toEqual([]);
    expect(getUpcomingHolidays('2082-01-01').length).toBeGreaterThan(40);
  });
});

describe('updating data', () => {
  it('setHolidayDates fills in an announced date', () => {
    setHolidayDates(2083, 'eid-al-fitr', ['2083-12-26']);
    const eid = getHolidays(2083).find((h) => h.id === 'eid-al-fitr')!;
    expect(eid.dateStatus).toBe('fixed');
    expect(isHoliday('2083-12-26', { includeSaturdays: false })).toBe(true);
    setHolidayDates(2083, 'eid-al-fitr', []);
    expect(getHolidays(2083).find((h) => h.id === 'eid-al-fitr')!.dateStatus).toBe('to-be-announced');
  });

  it('setHolidayDates validates', () => {
    expect(() => setHolidayDates(2090, 'x', [])).toThrow(RangeError);
    expect(() => setHolidayDates(2083, 'nope', [])).toThrow(/No holiday "nope"/);
    expect(() => setHolidayDates(2083, 'eid-al-fitr', ['2084-01-01'])).toThrow(/must be in BS 2083/);
  });

  it('registerHolidayYear adds a year and validates it', () => {
    const year: HolidayYear = {
      year: 2084,
      source: { title: 'test', published: '2083-11-18', url: 'https://example.com' },
      saturdaysOff: true,
      holidays: [
        {
          id: 'new-year',
          name: { en: 'New Year', ne: 'नव वर्ष' },
          dates: [{ year: 2084, month: 1, day: 1 }],
          dateStatus: 'fixed',
          scope: 'national',
          section: '2.1',
        },
      ],
    };
    registerHolidayYear(year);
    expect(getHolidayYears()).toEqual([2083, 2084]);
    expect(isHoliday('2084-01-01', { includeSaturdays: false })).toBe(true);

    const bad = (patch: Partial<HolidayYear['holidays'][number]>) => ({
      ...year,
      holidays: [{ ...year.holidays[0]!, ...patch }],
    });
    expect(() => registerHolidayYear(bad({ dates: [{ year: 2084, month: 6, day: 33 }] }))).toThrow(RangeError);
    // @ts-expect-error runtime check
    expect(() => registerHolidayYear(bad({ scope: 'party' }))).toThrow(/unknown scope/);
    expect(() => registerHolidayYear({ ...year, holidays: [year.holidays[0]!, year.holidays[0]!] })).toThrow(
      /duplicate/,
    );
    expect(() => registerHolidayYear({ ...year, year: 2084.5 })).toThrow(TypeError);
  });
});
