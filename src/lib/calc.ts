import { S, DayEntry } from '../state/appState'

export function eventHours(ev: DayEntry | null | undefined): number {
    if (!ev) return 0; 
    if (ev.type === 'office') return S.cfg.dayHours;
    if (ev.qty === 'whole') return S.cfg.dayHours;
    if (ev.qty === 'half') return S.cfg.dayHours / 2;
    if (ev.qty === 'hours') return Number(ev.hours) || S.cfg.dayHours;

    return S.cfg.dayHours;
}

export function day(hours: number): number {
    return +(hours / S.cfg.dayHours).toFixed(2);
}

export function ftm2(n: number): number {
    return + n.toFixed(2);
}

export interface RawStats {
    leaveHours: number;
    permitHours: number;
    office: number;
}

export function rawStats(year: number): RawStats {
    let leaveHours = 0;
    let permitHours = 0;
    let office = 0;

    const yStr = String(year) + '-';

    Object.entries(S.ev).forEach(([k, entries]) => {
        if (!k.startsWith(yStr)) return;

        (Array.isArray(entries) ? entries : [entries]).forEach((ev) => {
            const o = eventHours(ev);

            if(ev.type === 'leave') leaveHours += o;
            else if (ev.type === 'permit') permitHours += o;
            else if (ev.type === 'office') office += o;
        });
    });

    return { leaveHours, permitHours, office};    
}

export interface AmountCarriedOver {
    leaveDays: number;
    permitHours: number;
}

export function getAmountCarriedOverForYear(targetYear: number):  AmountCarriedOver {
    const manual = S.amountCOManual[String(targetYear)] || { leaveHours: 0, permitHours: 0};
    const leaveManualDays = ftm2(manual.leaveHours / S.cfg.dayHours);
    const permitManualHours = manual.permitHours;

    if (!S.cfg.aCOEnabled) return { leaveDays: leaveManualDays , permitHours: permitManualHours };

    const allY = [... new Set(Object.keys(S.ev).map((k) => parseInt(k.slice(0 , 4), 10)))].sort((a , b) => a - b);

    let acoL = 0;
    let acoP = 0;

    for (let y = allY[0] || targetYear; y < targetYear; y++) {
        const raw = rawStats(y);
        const manY = S.amountCOManual[String(y)] || {leaveHours: 0 , permitHours: 0 };

        const lTot = S.cfg.leaveTotal + acoL + ftm2(manY.leaveHours / S.cfg.dayHours );
        let leaveLeft = Math.max(0, lTot - day(raw.leaveHours));
        if (S.cfg.maxACOLeave > 0) leaveLeft = Math.min(leaveLeft , S.cfg.maxACOLeave);

        const pTot = S.cfg.permitHours + acoP + manY.permitHours;
        let perfLeft = Math.max(0, pTot - raw.permitHours);
        if (S.cfg.maxACOPermit > 0) perfLeft = Math.min(perfLeft , S.cfg.maxACOPermit);

        acoL = leaveLeft;
        acoP = perfLeft;
        
    }

    return { leaveDays: ftm2(acoL + leaveManualDays) , permitHours: ftm2(acoP + permitManualHours) };

}

export interface Stats {
    leaveHours: number;
    leaveCons: number;
    leaveACO: number;
    leaveTotalYearly: number;
    permitHours: number;
    permitDay: number;
    permitHourACO: number;
    permitTotalYearly: number;
    officeDays: number;
    amountCarriedOver: AmountCarriedOver;
    noteDeadlineMonth: number | null;
    noteDeadlineYear: number | null;

}

export function calcStats(year: number): Stats {
    const raw = rawStats(year);
    const aco = getAmountCarriedOverForYear(year);

    const lTot = S.cfg.leaveTotal + aco.leaveDays;
    const pTot = S.cfg.permitHours + aco.permitHours;
    const lCons = day(raw.leaveHours);

    let noteDeadlineMonth: number | null = null;
    let noteDeadlineYear: number | null = null;

    if (S.cfg.aCOEnabled && S.cfg.monthDeadline > 0 && (aco.leaveDays > 0 || aco.permitHours > 0)) {
        noteDeadlineMonth = S.cfg.monthDeadline;
        noteDeadlineYear = year;
    }

    return {
        leaveHours: raw.leaveHours,
        leaveCons: lCons,
        leaveACO: ftm2(Math.max(0 , lTot - lCons)),
        leaveTotalYearly: ftm2(lTot),
        permitHours: raw.permitHours,
        permitDay: day(raw.permitHours),
        permitHourACO: ftm2(Math.max(0 , pTot - raw.permitHours)),
        permitTotalYearly: ftm2(pTot),
        officeDays: raw.office,
        amountCarriedOver: aco,
        noteDeadlineMonth,
        noteDeadlineYear
    };
    
}