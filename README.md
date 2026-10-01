# nepali-miti-holidays

[![npm version](https://img.shields.io/npm/v/nepali-miti-holidays.svg)](https://www.npmjs.com/package/nepali-miti-holidays)
[![CI](https://github.com/alexblaze/nepali-miti-holidays/actions/workflows/ci.yml/badge.svg)](https://github.com/alexblaze/nepali-miti-holidays/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/nepali-miti-holidays.svg)](./LICENSE)

**Nepal's public holidays (सार्वजनिक बिदा) for BS 2083**, transcribed from the government's official Nepal Gazette
notice, with the information apps actually need: **who** gets the day off, an `isHoliday()` that never guesses, and
upcoming holidays. Built on [nepali-miti](https://github.com/alexblaze/nepali-miti).

- **One source: the gazette itself.** Nepal Rajpatra, Vol. 75, No. 67, Part 5 (2082-11-18), the Ministry of Home
  Affairs notice for BS 2083. Second-hand lists online disagree with it on details like who gets the day off, so
  this package uses the notice only.
- **Checked.** Tests confirm that each fixed holiday falls on the weekday printed in the gazette, and that Christmas,
  1 May, 3 December and 8 March land on those Gregorian dates.
- **Scopes match the notice.** Teej is for women employees, Indra Jatra is Kathmandu Valley only, Fagu Purnima is
  on different days in the hills and in the 21 listed Terai districts, and Civil Service Day keeps offices open.
- **Honest about unknown dates.** Eid, Bhoto Jatra and other "on the day" holidays are marked `to-be-announced` until
  you fill them in with `setHolidayDates`.
- **Small.** No dependencies besides `nepali-miti`. ESM and CommonJS, TypeScript types, and it works anywhere.

## Installation

```sh
npm install nepali-miti-holidays nepali-miti
```

## Usage

```ts
import { isHoliday, getHolidaysOn, getUpcomingHolidays } from 'nepali-miti-holidays';
import { toBs, today, format } from 'nepali-miti';

isHoliday('2083-07-01'); // true: Dashain
isHoliday(toBs('2026-12-25')); // true: Christmas
isHoliday('2083-05-29'); // false: Teej is for women employees only
isHoliday('2083-05-29', { scopes: ['national', 'women'] }); // true

getHolidaysOn('2083-01-18').map((h) => h.name.en);
// ['Chandi Purnima (Baisakh Purnima): Buddha Jayanti and Ubhauli Parva of the Kirat communities',
//  'International Labour Day (1 May)', 'Buddha Jayanti']

for (const { date, holiday } of getUpcomingHolidays(today({ timeZone: 'nepal' }), { scopes: ['national'], limit: 5 })) {
  console.log(format(date, 'D MMMM', { locale: 'ne' }), holiday.name.ne);
}
```

### Counting working days

```ts
import { addDays } from 'nepali-miti';
import { isHoliday } from 'nepali-miti-holidays';

function addWorkingDays(start, n) {
  let date = start;
  while (n > 0) {
    date = addDays(date, 1);
    if (!isHoliday(date)) n--;
  }
  return date;
}
```

### Disabling holidays in the date picker

```tsx
import { NepaliDatePicker } from 'nepali-miti-react';
import { isHoliday } from 'nepali-miti-holidays';

<NepaliDatePicker
  value={date}
  onChange={setDate}
  minDate={{ year: 2083, month: 1, day: 1 }}
  maxDate={{ year: 2083, month: 12, day: 30 }}
  isDateDisabled={(d) => isHoliday(d)}
/>;
```

## Scopes

Every holiday has a `scope` taken from the section of the notice it appears in:

| Scope              | Who gets the day off                                | Examples                                       |
| ------------------ | --------------------------------------------------- | ---------------------------------------------- |
| `national`         | Everyone nationwide                                 | Dashain, Tihar, Constitution Day, Women's Day  |
| `community`        | A community or religion (see `appliesTo`)           | Gai Jatra (Newar), Falgunanda Jayanti (Kirat)  |
| `region`           | Listed districts (see `districts` / `appliesTo`)    | Fagu Purnima (hill / Terai), Sirua Pawani      |
| `kathmandu-valley` | Kathmandu, Lalitpur and Bhaktapur                   | Indra Jatra, Ghode Jatra                       |
| `women`            | Women employees                                     | Teej, Jitiya                                   |
| `education`        | Educational institutions                            | Basanta Panchami                               |
| `disability`       | Employees with disabilities                         | International Day of Persons with Disabilities |
| `observance`       | Nobody: the day is marked but **offices stay open** | Civil Service Day                              |

`isHoliday` counts only `national` holidays (plus Saturdays) unless you pass `scopes`. `observance` days never count
as days off.

## API

All functions take a BS date as `{ year, month, day }` or a `"YYYY-MM-DD"` string (English or Devanagari digits).
Convert AD dates with nepali-miti's `toBs`.

| Function                                          | Returns                                                                                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isHoliday(date, { scopes?, includeSaturdays? })` | `true` for Saturdays (default) and holidays in `scopes` (default `['national']`). **Throws** for years with no data instead of saying "working day". |
| `getHolidaysOn(date, { scopes? })`                | All holidays on that day (several can share one). `[]` for years with no data.                                                                       |
| `getHolidays(year, { scopes? })`                  | The year's holidays sorted by date, with to-be-announced ones last. Throws for years with no data.                                                   |
| `getUpcomingHolidays(from, { scopes?, limit? })`  | `{ date, holiday }` per holiday day on or after `from` (Dashain gives 7 entries).                                                                    |
| `getHolidayYears()`                               | Years with data, e.g. `[2083]`.                                                                                                                      |
| `getHolidayYear(year)`                            | The raw `HolidayYear`: `source`, `saturdaysOff` and `holidays`.                                                                                      |
| `setHolidayDates(year, id, dates)`                | Fill in or correct a date, e.g. when Eid is announced.                                                                                               |
| `registerHolidayYear(data)`                       | Add next year's notice before a package update. Validates ids, scopes and dates.                                                                     |
| `resetHolidayData()`                              | Undo `setHolidayDates` and `registerHolidayYear`.                                                                                                    |
| `ALL_SCOPES`, `TERAI_FAGU_DISTRICTS`              | Constants.                                                                                                                                           |

A `Holiday` looks like this:

```ts
{
  id: 'dashain',
  name: { en: 'Dashain (Fulpati to Dwadashi)', ne: 'दशैं बिदा (फूलपातीदेखि द्वादशीसम्म)' },
  dates: [{ year: 2083, month: 6, day: 31 }, /* … */ { year: 2083, month: 7, day: 6 }],
  dateStatus: 'fixed',          // or 'to-be-announced' (dates: [])
  scope: 'national',
  appliesTo?: { en, ne },        // when narrower than everyone
  districts?: ['Jhapa', …],      // when limited to listed districts
  section: '2.1 (च)',            // clause of the gazette notice
}
```

## Data and limitations

- **Years:** BS 2083 only (14 April 2026 to 13 April 2027). The notice for each year is usually published in
  Falgun of the year before. New years will ship as minor releases. Until then, use `registerHolidayYear`.
- **To be announced in 2083:** Eid al-Fitr, Eid al-Adha (national), Bhoto Jatra (Kathmandu Valley), Sirua Pawani
  (Jhapa, Morang, Sunsari, Siraha, Saptari), Mohammad Jayanti (Muslims) and Guru Nanak Jayanti (Sikhs). The notice
  says these fall "on the day" of the festival.
- **Not included:** up to 6 extra days each province may declare, substitute holidays decided by individual offices,
  Nepali missions abroad (which may set up to 18 days of their own), and any one-off holidays the government announces
  during the year. Use `registerHolidayYear` or `setHolidayDates` for those.
- **Districts:** `isHoliday` does not take a district yet. Region-limited holidays carry their district list (Terai
  Fagu, Sirua), and you can filter on it yourself.
- This package is not legal advice. For anything that matters legally, check the latest government notice.

## Contributing

Corrections need a link to an official source. See [CONTRIBUTING.md](./CONTRIBUTING.md).

```sh
npm install && npm test && npm run lint && npm run build
```

## License

[MIT](./LICENSE) © alexblaze. Holiday dates and names are facts from a public government notice.
