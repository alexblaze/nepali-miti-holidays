import { daysInBsMonth, type BsDate } from 'nepali-miti';
import type { Holiday, HolidayScope, HolidayYear, LocalizedText } from '../types';

/*
 * Source: Nepal Rajpatra (Nepal Gazette), Vol. 75, No. 67, Part 5, 2082-11-18 —
 * Government of Nepal, Ministry of Home Affairs notice fixing public, festival and substitute holidays
 * for BS 2083 (Baisakh 1 to the end of Chaitra). Transcribed from the scanned gazette pages.
 * Every fixed date below was checked in tests against the weekday printed in the gazette.
 */

const d = (month: number, day: number): BsDate => ({ year: 2083, month, day });

const range = (from: BsDate, to: BsDate): BsDate[] => {
  const out: BsDate[] = [];
  // Ranges in this notice are within one or two consecutive months of the same year.
  for (let m = from.month; m <= to.month; m++) {
    const start = m === from.month ? from.day : 1;
    const end = m === to.month ? to.day : daysInBsMonth(2083, m);
    for (let day = start; day <= end; day++) out.push(d(m, day));
  }
  return out;
};

const t = (en: string, ne: string): LocalizedText => ({ en, ne });

function h(
  id: string,
  name: LocalizedText,
  dates: BsDate[],
  scope: HolidayScope,
  section: string,
  extra: { appliesTo?: LocalizedText; districts?: string[] } = {},
): Holiday {
  return { id, name, dates, dateStatus: dates.length ? 'fixed' : 'to-be-announced', scope, section, ...extra };
}

export const TERAI_FAGU_DISTRICTS = [
  'Jhapa',
  'Morang',
  'Sunsari',
  'Saptari',
  'Siraha',
  'Udayapur',
  'Dhanusha',
  'Mahottari',
  'Sarlahi',
  'Rautahat',
  'Bara',
  'Parsa',
  'Nawalparasi (Bardaghat Susta East)',
  'Nawalparasi (Bardaghat Susta West)',
  'Rupandehi',
  'Kapilvastu',
  'Dang',
  'Banke',
  'Bardiya',
  'Kailali',
  'Kanchanpur',
] as const;

const SIRUA_DISTRICTS = ['Jhapa', 'Morang', 'Sunsari', 'Siraha', 'Saptari'];

export const HOLIDAYS_2083: HolidayYear = {
  year: 2083,
  source: {
    title:
      'Nepal Rajpatra, Vol. 75, No. 67, Part 5 (2082-11-18): Ministry of Home Affairs notice on public holidays for BS 2083',
    published: '2082-11-18',
    url: 'https://www.ratopati.com/story/547692/public-holidays-to-be-declared-in-2083-bs-see-list',
  },
  saturdaysOff: true,
  holidays: [
    // 2.1 Festival holidays for everyone nationwide
    h('new-year', t('Nepali New Year', 'नव वर्ष'), [d(1, 1)], 'national', '2.1 (क)'),
    h(
      'chandi-purnima',
      t(
        'Chandi Purnima (Baisakh Purnima): Buddha Jayanti and Ubhauli Parva of the Kirat communities',
        'चण्डी पूर्णिमा (वैशाख पूर्णिमा) – बुद्ध जयन्ती, किराँत समुदायको उभौली पर्व',
      ),
      [d(1, 18)],
      'national',
      '2.1 (ख)',
    ),
    h('raksha-bandhan', t('Raksha Bandhan', 'रक्षाबन्धन'), [d(5, 12)], 'national', '2.1 (ग)'),
    h('krishna-janmashtami', t('Shree Krishna Janmashtami', 'श्रीकृष्ण जन्माष्टमी'), [d(5, 19)], 'national', '2.1 (घ)'),
    h('ghatasthapana', t('Ghatasthapana', 'घटस्थापना'), [d(6, 25)], 'national', '2.1 (ङ)'),
    h(
      'dashain',
      t('Dashain (Fulpati to Dwadashi)', 'दशैं बिदा (फूलपातीदेखि द्वादशीसम्म)'),
      range(d(6, 31), d(7, 6)),
      'national',
      '2.1 (च)',
    ),
    h(
      'tihar',
      t('Tihar (Laxmi Puja to the day after Bhai Tika)', 'तिहार बिदा (लक्ष्मीपूजादेखि भाइटिकाको भोलिपल्टसम्म)'),
      range(d(7, 22), d(7, 26)),
      'national',
      '2.1 (छ)',
    ),
    h('chhath', t('Chhath Parva', 'छठ पर्व'), [d(7, 29)], 'national', '2.1 (ज)'),
    h(
      'dhanya-purnima',
      t(
        'Dhanya Purnima: Udhauli Parva of the Kirat communities, Yomari Punhi, Jyapu Day',
        'धान्य पूर्णिमा – किराँत समुदायको उधौली पर्व, योमरी पुन्हि, ज्यापू दिवस',
      ),
      [d(9, 9)],
      'national',
      '2.1 (झ)',
    ),
    h('christmas', t('Christmas Day (25 December)', 'क्रिसमस डे (डिसेम्बर २५)'), [d(9, 10)], 'national', '2.1 (ञ)'),
    h('tamu-lhosar', t('Tamu Lhosar', 'तमू ल्होछार'), [d(9, 15)], 'national', '2.1 (ट)'),
    h(
      'maghe-sankranti',
      t('Maghi Parva / Maghe Sankranti', 'माघी पर्व/माघे सङ्क्रान्ति'),
      [d(10, 1)],
      'national',
      '2.1 (ठ)',
    ),
    h('sonam-lhosar', t('Sonam Lhosar', 'सोनम ल्होछार'), [d(10, 24)], 'national', '2.1 (ड)'),
    h('maha-shivaratri', t('Maha Shivaratri', 'महाशिवरात्री'), [d(11, 22)], 'national', '2.1 (ढ)'),
    h('gyalpo-lhosar', t('Gyalpo Lhosar', 'ग्याल्पो ल्होसार'), [d(11, 25)], 'national', '2.1 (ण)'),
    h('eid-al-fitr', t('Eid al-Fitr', 'ईद (ईद उल फित्र)'), [], 'national', '2.1 (त)'),
    h('eid-al-adha', t('Eid al-Adha (Bakar Eid)', 'बकर ईद (ईद उल अजहा)'), [], 'national', '2.1 (थ)'),
    h(
      'fagu-purnima-hill',
      t('Fagu Purnima (mountain and hill districts)', 'फागुपूर्णिमा (हिमाली र पहाडी जिल्ला)'),
      [d(12, 7)],
      'region',
      '2.1 (द)',
      { appliesTo: t('The 56 mountain and hill districts', 'हिमाली र पहाडी ५६ जिल्ला') },
    ),
    h(
      'fagu-purnima-terai',
      t('Fagu Purnima (Terai districts)', 'फागुपूर्णिमा (तराईका जिल्ला)'),
      [d(12, 8)],
      'region',
      '2.1 (द)',
      {
        appliesTo: t('The 21 Terai districts listed', 'तोकिएका तराईका २१ जिल्ला'),
        districts: [...TERAI_FAGU_DISTRICTS],
      },
    ),

    // 2.2 Festival holidays only for the relevant religion, culture, area or place
    h('gai-jatra', t('Gai Jatra', 'गाईजात्रा'), [d(5, 13)], 'community', '2.2 (क)', {
      appliesTo: t('Newar community nationwide', 'देशभरका नेवार समुदाय'),
    }),
    h('gaura-parva', t('Gaura Parva', 'गौरा पर्व'), [d(5, 19)], 'community', '2.2 (ख)', {
      appliesTo: t('Those who celebrate it', 'सो पर्व मनाउनेहरू'),
    }),
    h('dura-mhaipru-nakuma', t('Dura Mhaipru Nakuma', 'दुरा म्हैप्रु नकुमा'), [d(9, 15)], 'community', '2.2 (ग)', {
      appliesTo: t('Dura community nationwide', 'देशभरका दुरा समुदाय'),
    }),
    h('sirua-pawani', t('Sirua Pawani', 'सिरुवा पावनी'), [], 'region', '2.2 (घ)', {
      appliesTo: t('Districts that celebrate it', 'सो पर्व मनाउने जिल्ला'),
      districts: SIRUA_DISTRICTS,
    }),

    // 3. Women employees only
    h('teej', t('Haritalika (Teej) Vrat', 'हरितालिका (तीज) व्रत'), [d(5, 29)], 'women', '3 (क)', {
      appliesTo: t('Women employees', 'महिला कर्मचारी'),
    }),
    h('jitiya', t('Jitiya Parva', 'जितिया पर्व'), [d(6, 18)], 'women', '3 (ख)', {
      appliesTo: t('Women employees who observe Jitiya', 'जितिया पर्व मनाउने महिला कर्मचारी'),
    }),

    // 4. Educational institutions only
    h('basanta-panchami', t('Basanta Panchami', 'वसन्त पञ्चमी'), [d(10, 28)], 'education', '4', {
      appliesTo: t('Educational institutions', 'शिक्षण संस्था'),
    }),

    // 5. Jatra holidays, Kathmandu Valley only
    h('gai-jatra-kathmandu', t('Gai Jatra', 'गाईजात्रा'), [d(5, 13)], 'kathmandu-valley', '5 (क)'),
    h('indra-jatra', t('Indra Jatra', 'इन्द्रजात्रा'), [d(6, 9)], 'kathmandu-valley', '5 (ख)'),
    h(
      'bhoto-jatra',
      t('Bhoto Jatra of Matsyendranath', 'मत्स्येन्द्रनाथको भोटो देखाउने जात्रा'),
      [],
      'kathmandu-valley',
      '5 (ग)',
    ),
    h('ghode-jatra', t('Ghode Jatra', 'घोडेजात्रा'), [d(12, 23)], 'kathmandu-valley', '5 (घ)'),

    // 6.1 Days observed with a public holiday for everyone nationwide
    h(
      'labour-day',
      t('International Labour Day (1 May)', 'विश्व मजदुर दिवस (मे १)'),
      [d(1, 18)],
      'national',
      '6.1 (क)',
    ),
    h('republic-day', t('Republic Day', 'गणतन्त्र दिवस'), [d(2, 15)], 'national', '6.1 (ख)'),
    h(
      'constitution-day',
      t('Constitution Day (National Day)', 'संविधान दिवस (राष्ट्रिय दिवस)'),
      [d(6, 3)],
      'national',
      '6.1 (ग)',
    ),
    h('martyrs-day', t("Martyrs' Day", 'सहिद दिवस'), [d(10, 16)], 'national', '6.1 (घ)'),
    h('democracy-day', t('National Democracy Day', 'राष्ट्रिय प्रजातन्त्र दिवस'), [d(11, 7)], 'national', '6.1 (ङ)'),
    h(
      'womens-day',
      t("International Women's Day (8 March)", 'अन्तर्राष्ट्रिय महिला दिवस (मार्च ८)'),
      [d(11, 24)],
      'national',
      '6.1 (च)',
    ),

    // 6.2 Employees with disabilities only
    h(
      'disability-day',
      t('International Day of Persons with Disabilities (3 December)', 'अन्तर्राष्ट्रिय अपाङ्गता दिवस (डिसेम्बर ३)'),
      [d(8, 17)],
      'disability',
      '6.2',
      { appliesTo: t('All employees with disabilities in Nepal', 'अपाङ्गता भएका नेपालभित्रका सम्पूर्ण कर्मचारी') },
    ),

    // 7.1 Birth anniversaries with a public holiday for everyone nationwide
    h('buddha-jayanti', t('Buddha Jayanti', 'बुद्ध जयन्ती'), [d(1, 18)], 'national', '7.1 (क)'),
    h(
      'prithvi-jayanti',
      t('Prithvi Jayanti (National Unity Day)', 'पृथ्वी जयन्ती (राष्ट्रिय एकता दिवस)'),
      [d(9, 27)],
      'national',
      '7.1 (ख)',
    ),

    // 7.2 Birth anniversaries for followers of the relevant religion only
    h('falgunanda-jayanti', t('Falgunanda Jayanti', 'फाल्गुनन्द जयन्ती'), [d(7, 25)], 'community', '7.2 (क)', {
      appliesTo: t('Followers of the Kirat religion', 'किराँत धर्मावलम्बी'),
    }),
    h('mohammad-jayanti', t('Mohammad Jayanti', 'मोहम्मद जयन्ती'), [], 'community', '7.2 (ख)', {
      appliesTo: t('Nepali Muslims', 'नेपाली मुस्लिम धर्मावलम्बी'),
    }),
    h('guru-nanak-jayanti', t('Guru Nanak Jayanti', 'गुरु नानक जयन्ती'), [], 'community', '7.2 (ग)', {
      appliesTo: t('Nepali Sikhs', 'नेपाली सिख धर्मावलम्बी'),
    }),

    // 8. Observed nationally, offices open
    h(
      'caste-discrimination-elimination-day',
      t(
        'National Day for the Elimination of Caste-based Discrimination and Untouchability',
        'जातीय भेदभाव तथा छुवाछुत उन्मूलन राष्ट्रिय दिवस',
      ),
      [d(2, 21)],
      'observance',
      '8 (क)',
    ),
    h('civil-service-day', t('Civil Service Day', 'निजामती सेवा दिवस'), [d(5, 22)], 'observance', '8 (ख)'),
    h('gen-z-martyrs-day', t("Gen Z Martyrs' Day", 'जेनजी सहिद दिवस'), [d(5, 23)], 'observance', '8 (ग)'),
  ],
};
