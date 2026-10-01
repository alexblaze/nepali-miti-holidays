import type { BsDate } from 'nepali-miti';

/**
 * Who gets the day off, following the sections of the government notice.
 *
 * - `national`: every government office and public body nationwide.
 * - `community`: only people of a particular community or religion (e.g. Newar community for Gai Jatra).
 * - `region`: only certain districts (e.g. Fagu Purnima in the Terai).
 * - `kathmandu-valley`: only the three Kathmandu Valley districts (jatras).
 * - `women`: only women employees (Teej, Jitiya).
 * - `education`: only educational institutions (Basanta Panchami).
 * - `disability`: only employees with disabilities.
 * - `observance`: celebrated nationally but offices stay open — not a day off.
 */
export type HolidayScope =
  'national' | 'community' | 'region' | 'kathmandu-valley' | 'women' | 'education' | 'disability' | 'observance';

export interface LocalizedText {
  readonly en: string;
  readonly ne: string;
}

export interface Holiday {
  /** Stable identifier, unique within a year (e.g. `"dashain"`). */
  readonly id: string;
  readonly name: LocalizedText;
  /**
   * The BS dates of the holiday, in order. Multi-day holidays (Dashain, Tihar) list every day.
   * Empty when the notice says the holiday falls "on the day" of a lunar/Islamic festival
   * that is announced later (see `dateStatus`).
   */
  readonly dates: readonly BsDate[];
  /** `"fixed"` when the notice gives the date; `"to-be-announced"` when it does not. */
  readonly dateStatus: 'fixed' | 'to-be-announced';
  readonly scope: HolidayScope;
  /** Who it applies to, when that is narrower than everyone. */
  readonly appliesTo?: LocalizedText;
  /** District names (English) when the holiday applies only in listed districts. */
  readonly districts?: readonly string[];
  /** Clause of the source notice this entry comes from, as numbered there, e.g. `"2.1 (च)"`. */
  readonly section: string;
}

export interface HolidaySource {
  /** Human-readable citation. */
  readonly title: string;
  /** BS publication date of the notice, `YYYY-MM-DD`. */
  readonly published: string;
  /** Where the source can be read. */
  readonly url: string;
}

export interface HolidayYear {
  readonly year: number;
  readonly source: HolidaySource;
  /** `true` when every Saturday of the year is a public holiday (it is in Nepal). */
  readonly saturdaysOff: boolean;
  readonly holidays: readonly Holiday[];
}
