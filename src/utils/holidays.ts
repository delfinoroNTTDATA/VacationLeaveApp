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

export function getHolidays(year: number, paese: string): Map<string, string> {
    const h = new Map<string, string>();
    const add = (m: number, d: number, nome: string) => 
        h.set(`${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2,'0')}`, nome);

    const e = easter(year);
    const eL = addDays(e,1);
    const asc = addDays(e, 39);
    const pen = addDays(e,49);
    const penL = addDays(e,50);

    add(1,1,'Capodanno'); add(12,25,'Natale')

    return h;
}