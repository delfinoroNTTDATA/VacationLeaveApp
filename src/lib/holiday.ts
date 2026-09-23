import { CAL } from "../state/appState";
import { LOCALES , CountryCode , LangCode } from "./locales";
import { labelForKey } from "./holidayNames";

function pad(n: number): string {
    return String(n).padStart(2, '0');
}

export function getHolidayKeys(year: number , country: CountryCode): Map<string , string> {
    const h = new Map<string , string>();
    const add = (m: number, d: number, key: string) => h.set(`${year}-${pad(m)}-${pad(d)}` , key);
    const addDate = (dt: Date, key: string) => h.set(`${dt.getFullYear()}-${pad(dt.getMonth())}-${dt.getDate()}`,key)

    function easter(y: number): Date {
        const a = y % 19;
        const b = Math.floor(y / 100);
        const c = y % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h2 = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h2 - k) % 7;
        const m = Math.floor((a + 11 * h2 + 22 * l) / 451);
        const mo = Math.floor((h2 + l - 7 * m + 114) / 31);
        const day = ((h2 + l - 7 * m + 111) % 31) + 1;
        
        return new Date(y, mo - 1, day);
    }

    const eD = easter(year);
    const eM = new Date(eD);
    eM.setDate(eM.getDate() + 1);

    const asc = new Date(eD);
    asc.setDate(asc.getDate() + 39);

    const pen = new Date(asc);
    pen.setDate(pen.getDate() + 10);

    const penL = new Date(pen);
    penL.setDate(penL.getDate() + 1);

    switch (country) {
    case 'IT':
      add(1, 1, 'new_year'); add(1, 6, 'epiphany'); add(4, 25, 'it_liberation'); add(5, 1, 'labor_day');
      add(6, 2, 'it_republic'); add(8, 15, 'it_ferragosto'); add(11, 1, 'all_saints'); add(12, 8, 'immaculate');
      add(12, 25, 'christmas'); add(12, 26, 'st_stephen');
      addDate(eD, 'easter'); addDate(eM, 'easter_monday');
      break;
    case 'DE':
      add(1, 1, 'new_year'); add(1, 6, 'epiphany'); add(5, 1, 'labor_day');
      add(10, 3, 'de_unity'); add(11, 1, 'all_saints'); add(12, 25, 'christmas'); add(12, 26, 'st_stephen');
      addDate(eD, 'easter'); addDate(eM, 'easter_monday');
      addDate(asc, 'ascension'); addDate(pen, 'pentecost'); addDate(penL, 'pentecost_monday');
      break;
    case 'FR':
      add(1, 1, 'new_year'); add(5, 1, 'labor_day'); add(5, 8, 'fr_victory_1945'); add(7, 14, 'fr_bastille');
      add(8, 15, 'assumption'); add(11, 1, 'all_saints'); add(11, 11, 'fr_armistice'); add(12, 25, 'christmas');
      addDate(eM, 'easter_monday'); addDate(asc, 'ascension'); addDate(pen, 'pentecost');
      break;
    case 'ES':
      add(1, 1, 'new_year'); add(1, 6, 'epiphany'); add(5, 1, 'labor_day');
      add(8, 15, 'assumption'); add(10, 12, 'es_national'); add(11, 1, 'all_saints');
      add(12, 6, 'es_constitution'); add(12, 8, 'immaculate'); add(12, 25, 'christmas');
      addDate(eD, 'good_friday');
      break;
    case 'UK':
      add(1, 1, 'new_year'); add(5, 1, 'uk_may_bank'); add(8, 28, 'uk_summer_bank');
      add(12, 25, 'christmas'); add(12, 26, 'boxing_day'); add(12, 27, 'uk_christmas_sub');
      addDate(eD, 'good_friday'); addDate(eM, 'easter_monday');
      break;
    case 'US':
      add(1, 1, 'new_year'); add(7, 4, 'us_independence'); add(11, 11, 'us_veterans'); add(12, 25, 'christmas');
      { let dt = new Date(year, 0, 1), cnt = 0; while (dt.getDay() !== 1 || ++cnt < 3) dt.setDate(dt.getDate() + 1); addDate(dt, 'us_mlk'); }
      { let dt = new Date(year, 4, 31); while (dt.getDay() !== 1) dt.setDate(dt.getDate() - 1); addDate(dt, 'us_memorial'); }
      { let dt = new Date(year, 8, 1); while (dt.getDay() !== 1) dt.setDate(dt.getDate() + 1); addDate(dt, 'us_labor'); }
      { let dt = new Date(year, 10, 1), cnt = 0; while (dt.getDay() !== 4 || ++cnt < 4) dt.setDate(dt.getDate() + 1); addDate(dt, 'us_thanksgiving'); }
      break;
    case 'CH':
      add(1, 1, 'new_year'); add(1, 2, 'ch_berchtold'); add(5, 1, 'labor_day'); add(8, 1, 'ch_national');
      add(11, 1, 'all_saints'); add(12, 25, 'christmas'); add(12, 26, 'st_stephen');
      addDate(eD, 'easter'); addDate(eM, 'easter_monday'); addDate(asc, 'ascension'); addDate(pen, 'pentecost');
      break;
    case 'NL':
      add(1, 1, 'new_year'); add(4, 27, 'nl_kings_day'); add(5, 5, 'nl_liberation'); add(12, 5, 'nl_sinterklaas');
      add(12, 25, 'christmas'); add(12, 26, 'st_stephen');
      addDate(eD, 'easter'); addDate(eM, 'easter_monday');
      addDate(asc, 'ascension'); addDate(pen, 'pentecost'); addDate(penL, 'pentecost_monday');
      break;
    case 'BE':
      add(1, 1, 'new_year'); add(5, 1, 'labor_day'); add(7, 21, 'be_national'); add(8, 15, 'assumption');
      add(11, 1, 'all_saints'); add(11, 11, 'fr_armistice'); add(12, 25, 'christmas'); add(12, 26, 'st_stephen');
      addDate(eM, 'easter_monday'); addDate(asc, 'ascension'); addDate(pen, 'pentecost'); addDate(penL, 'pentecost_monday');
      break;
    case 'PT':
      add(1, 1, 'new_year'); add(2, 28, 'pt_carnival'); add(4, 25, 'pt_freedom'); add(5, 1, 'labor_day');
      add(6, 10, 'pt_portugal_day'); add(8, 15, 'assumption'); add(10, 5, 'pt_republic');
      add(11, 1, 'all_saints'); add(12, 1, 'pt_restoration'); add(12, 8, 'immaculate'); add(12, 25, 'christmas');
      addDate(eD, 'easter');
      break;
  }

  return h;
}

let _keyCache: Record<string, Map<string , string>> = {};

export function clearHolidayCache() {
    _keyCache = {};
}

function keysFor(year: number, country: CountryCode): Map<string , string> {
    const k = `${year}-${country}`;

    if (!_keyCache[k]) _keyCache[k] = getHolidayKeys(year , country);
    return _keyCache[k];
}

export function currentCountry(): CountryCode {
    return LOCALES[CAL.local].country;
}

export function holidayForYear(year: number):   Map<string , string> {
    return keysFor(year , currentCountry());
}

export function isHoliday(ds: string): boolean {
    const y = parseInt(ds.split('-')[0], 10);
    return holidayForYear(y).has(ds);
}

export function holidayName(ds: string , lang: LangCode): string | null {
    const y = parseInt(ds.split('-')[0], 10);
    const key = holidayForYear(y).get(ds);

    return key ? labelForKey(key , lang) : null;
}

export interface ExtraHoliday {
    country: CountryCode;
    name: string;
}

export function extraHolidayFor(ds: string , lang: LangCode): ExtraHoliday[] {
    const y = parseInt(ds.split('-')[0] , 10);
    const out: ExtraHoliday[] = [];

    (CAL.extraCountries || []).forEach((country) => {
      if (country === currentCountry()) return;
      const key = keysFor(y , country).get(ds);
      if(key) out.push({ country , name: labelForKey(key , lang) });
    })

    return out;
}

export function isWeekend(ds: string): boolean {
  const [year, month, day] = ds.split('-').map(Number);
  const dow = new Date(year, month -  1, day).getDay();
  return dow === 0 || dow === 6;
}

export function isExcluded(ds: string): boolean {
  if(isWeekend(ds) && !CAL.inclWE) return true;
  if(isHoliday(ds) && CAL.exlLeave) return true;
  
  return false;
}

export function rangeDays(start: string , end: string): string[] {
  const days: string[] = [];
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);

  const curDate = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);

  while (curDate <= endDate) {
    const ds = `${curDate.getFullYear()}-${pad(curDate.getMonth() + 1)}-${pad(curDate.getDate())}`;
    if(!isExcluded(ds)) days.push(ds);
    curDate.setDate(curDate.getDate() + 1);
  }

  return days;
}

export const COUNTRY_FLAG: Record<CountryCode , string> = {
  IT: '🇮🇹',
  DE: '🇩🇪',
  FR: '🇫🇷',
  ES: '🇪🇸',
  UK: '🇬🇧',
  US: '🇺🇸',
  CH: '🇨🇭',
  NL: '🇳🇱',
  BE: '🇧🇪',
  PT: '🇵🇹'
}

export const COUNTRY_NAMES: Record<CountryCode, Record<LangCode, string>> = {
  IT: { it: 'Italia', en: 'Italy', de: 'Italien', fr: 'Italie', es: 'Italia', nl: 'Italië', pt: 'Itália' },
  DE: { it: 'Germania', en: 'Germany', de: 'Deutschland', fr: 'Allemagne', es: 'Alemania', nl: 'Duitsland', pt: 'Alemanha' },
  FR: { it: 'Francia', en: 'France', de: 'Frankreich', fr: 'France', es: 'Francia', nl: 'Frankrijk', pt: 'França' },
  ES: { it: 'Spagna', en: 'Spain', de: 'Spanien', fr: 'Espagne', es: 'España', nl: 'Spanje', pt: 'Espanha' },
  UK: { it: 'Regno Unito', en: 'United Kingdom', de: 'Vereinigtes Königreich', fr: 'Royaume-Uni', es: 'Reino Unido', nl: 'Verenigd Koninkrijk', pt: 'Reino Unido' },
  US: { it: 'Stati Uniti', en: 'United States', de: 'Vereinigte Staaten', fr: 'États-Unis', es: 'Estados Unidos', nl: 'Verenigde Staten', pt: 'Estados Unidos' },
  CH: { it: 'Svizzera', en: 'Switzerland', de: 'Schweiz', fr: 'Suisse', es: 'Suiza', nl: 'Zwitserland', pt: 'Suíça' },
  NL: { it: 'Paesi Bassi', en: 'Netherlands', de: 'Niederlande', fr: 'Pays-Bas', es: 'Países Bajos', nl: 'Nederland', pt: 'Países Baixos' },
  BE: { it: 'Belgio', en: 'Belgium', de: 'Belgien', fr: 'Belgique', es: 'Bélgica', nl: 'België', pt: 'Bélgica' },
  PT: { it: 'Portogallo', en: 'Portugal', de: 'Portugal', fr: 'Portugal', es: 'Portugal', nl: 'Portugal', pt: 'Portugal' },
};

export function countryName(cc: CountryCode , lang: LangCode): string {
  const e = COUNTRY_NAMES[cc];
  if(!e) return cc;

  return e[lang] || e.it || cc;
}