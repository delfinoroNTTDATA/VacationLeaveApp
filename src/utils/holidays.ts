function easter(year: number): Date {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4),  e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a+b - d - g + 15);
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * 1) / 451);
    const month = Math.floor((h + 1 - 7 * m + 114) / 31);
    const day = ((h + 1 - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day); 
}

function dateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
} 

function addDays(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

export function getHolidayKeys(year: number, country: string) : Map<string, string> {
    const h = new Map<string, string>();

    const add = (m: number, d: number, key: string) => h.set(`${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,key);

    const addD = (dt: Date, key: string) => h.set(dateStr(dt), key);

    const e = easter(year), eM = addDays(e,1), asc = addDays(e,39),
    pen = addDays(e,49), penM = addDays(e,50);

    switch (country) {
    case 'IT':
      add(1,1,'new_year'); add(1,6,'epiphany'); add(4,25,'it_liberation'); add(5,1,'labor_day');
      add(6,2,'it_republic'); add(8,15,'it_ferragosto'); add(11,1,'all_saints'); add(12,8,'immaculate');
      add(12,25,'christmas'); add(12,26,'st_stephen'); addD(e,'easter'); addD(eM,'easter_monday');
      break;
    case 'DE':
      add(1,1,'new_year'); add(1,6,'epiphany'); add(5,1,'labor_day'); add(10,3,'de_unity');
      add(11,1,'all_saints'); add(12,25,'christmas'); add(12,26,'st_stephen');
      addD(e,'easter'); addD(eM,'easter_monday'); addD(asc,'ascension'); addD(pen,'pentecost'); addD(penM,'pentecost_monday');
      break;
    case 'FR':
      add(1,1,'new_year'); add(5,1,'labor_day'); add(5,8,'fr_victory_1945'); add(7,14,'fr_bastille');
      add(8,15,'assumption'); add(11,1,'all_saints'); add(11,11,'fr_armistice'); add(12,25,'christmas');
      addD(eM,'easter_monday'); addD(asc,'ascension'); addD(pen,'pentecost');
      break;
    case 'ES':
      add(1,1,'new_year'); add(1,6,'epiphany'); add(5,1,'labor_day'); add(8,15,'assumption');
      add(10,12,'es_national'); add(11,1,'all_saints'); add(12,6,'es_constitution'); add(12,8,'immaculate'); add(12,25,'christmas');
      addD(e,'good_friday');
      break;
    case 'UK':
      add(1,1,'new_year'); add(5,1,'uk_may_bank'); add(8,28,'uk_summer_bank');
      add(12,25,'christmas'); add(12,26,'boxing_day'); add(12,27,'uk_christmas_sub');
      addD(e,'good_friday'); addD(eM,'easter_monday');
      break;
    case 'US': {
      add(1,1,'new_year'); add(7,4,'us_independence'); add(11,11,'us_veterans'); add(12,25,'christmas');
      let dt=new Date(year,0,1),cnt=0; while(dt.getDay()!==1||++cnt<3) dt.setDate(dt.getDate()+1); addD(dt,'us_mlk');
      dt=new Date(year,4,31); while(dt.getDay()!==1) dt.setDate(dt.getDate()-1); addD(dt,'us_memorial');
      dt=new Date(year,8,1); while(dt.getDay()!==1) dt.setDate(dt.getDate()+1); addD(dt,'us_labor');
      dt=new Date(year,10,1); cnt=0; while(dt.getDay()!==4||++cnt<4) dt.setDate(dt.getDate()+1); addD(dt,'us_thanksgiving');
      break;
    }
    case 'CH':
      add(1,1,'new_year'); add(1,2,'ch_berchtold'); add(5,1,'labor_day'); add(8,1,'ch_national');
      add(11,1,'all_saints'); add(12,25,'christmas'); add(12,26,'st_stephen');
      addD(e,'easter'); addD(eM,'easter_monday'); addD(asc,'ascension'); addD(pen,'pentecost');
      break;
    case 'NL':
      add(1,1,'new_year'); add(4,27,'nl_kings_day'); add(5,5,'nl_liberation'); add(12,5,'nl_sinterklaas');
      add(12,25,'christmas'); add(12,26,'st_stephen');
      addD(e,'easter'); addD(eM,'easter_monday'); addD(asc,'ascension'); addD(pen,'pentecost'); addD(penM,'pentecost_monday');
      break;
    case 'BE':
      add(1,1,'new_year'); add(5,1,'labor_day'); add(7,21,'be_national'); add(8,15,'assumption');
      add(11,1,'all_saints'); add(11,11,'fr_armistice'); add(12,25,'christmas'); add(12,26,'st_stephen');
      addD(eM,'easter_monday'); addD(asc,'ascension'); addD(pen,'pentecost'); addD(penM,'pentecost_monday');
      break;
    case 'PT':
      add(1,1,'new_year'); add(2,28,'pt_carnival'); add(4,25,'pt_freedom'); add(5,1,'labor_day');
      add(6,10,'pt_portugal_day'); add(8,15,'assumption'); add(10,5,'pt_republic');
      add(11,1,'all_saints'); add(12,1,'pt_restoration'); add(12,8,'immaculate'); add(12,25,'christmas');
      addD(e,'easter');
      break;
  }

  return h;
}

export function isWeekend(ds: string) : boolean {
    const [y, m, d] = ds.split('-').map(Number);

    const dow = new Date(y, m-1, d).getDay();

    return dow === 0 || dow === 6;
}

export function rangeDays(
    start: string, end: string,
    inclWE: boolean, exclHoliday: boolean, country: string
) : string[] {
    const [sy, sm, sd] = start.split('-').map(Number);
    const [ey, em, ed] = end.split('-').map(Number);

    const startDate = new Date(sy, sm - 1, sd);
    const endDate = new Date(ey, em - 1, ed);

    const days: string[] = [];
    
    const cache = new Map<number, Map<string, string>>();

    const getH = (year: number) => {
        if(!cache.has(year)) cache.set(year, getHolidayKeys(year, country));
        return cache.get(year);
    };

    const cur = new Date(startDate);

    while (cur <= endDate) {
        const ds = dateStr(cur);
        const isWE = isWeekend(ds);
        const isHoliday = getH(cur.getFullYear())?.has(ds);

        if((!isWE || inclWE) && (!isHoliday || !exclHoliday)) days.push(ds);
        cur.setDate(cur.getDate() + 1);
    }

    return days;
}