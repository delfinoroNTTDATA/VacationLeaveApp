import { useSyncExternalStore } from "react";
import { DEFAULT_LOCAL, CountryCode } from "../lib/locales";

export type EventType = 'leave' | 'permit' | 'office';
export type EventQty = 'whole' | 'half' | 'hours';
export type HalfPeriod = 'morning' | 'afternoon';

export interface DayEntry {
    type : EventType;
    qty : EventQty;
    half: HalfPeriod;
    hours: number;
}

export interface AppConfig {
    leaveTotal: number;
    permitHours: number;
    dayHours: number;
    year: number;
    aCOEnabled: boolean;
    maxACOLeave: number;
    maxACOPermit: number;
    monthDeadline: number;
}

export interface CarriedOverManual{
    leaveHours: number;
    permitHours: number;
}

export interface Selection {
    dates: string[];
    type: EventType | null;
    qty: EventQty;
    half: HalfPeriod;
    hours: number;
}

export interface AppState {
    cfg: AppConfig;
    ev: Record<string , DayEntry []>;
    amountCOManual: Record<string , CarriedOverManual>;
    vm: { y: number; m: number};
    sel: Selection;
    mode: 'single' | 'range';
    ready: boolean;
}

export const MONTHS_IT = [
    '', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const now = new Date();

export const S : AppState = {
    cfg : {
        leaveTotal: 28, permitHours: 104, dayHours: 8, year: now.getFullYear(),
        aCOEnabled: false, maxACOLeave: 0, maxACOPermit: 0, monthDeadline: 0
    },
    ev: {},
    amountCOManual: {},
    vm: { y: now.getFullYear(), m: now.getMonth() },
    sel: { dates: [], type: null, qty: 'whole', half: 'morning', hours: 1 },
    mode: 'single',
    ready: false
};

export interface CalState {
    inclWE: boolean;
    exlLeave: boolean;
    local: string;
    rangeStart: string | null;
    extraCountries: CountryCode[];
}

export const CAL : CalState = {
    inclWE: false,
    exlLeave: true,
    local: DEFAULT_LOCAL,
    rangeStart: null,
    extraCountries: []
};

export const session : { uid: string | null; email: string | null} = { uid: null , email: null };

let version = 0;
const listeners = new Set < () => void>();

export function notify(){
    version++;
    listeners.forEach( (l) => l());
}

function subscribe (listener : () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    return version;
}

export function useAppVersion() : number {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function resetLocalState() {
    S.cfg = {
        leaveTotal: 28, permitHours: 104, dayHours: 8, year: new Date().getFullYear(),
        aCOEnabled: false, maxACOLeave: 0, maxACOPermit: 0, monthDeadline: 0 
    };
    S.ev = {};
    S.amountCOManual = {};
    S.sel = { dates: [], type: null, qty: 'whole', half: 'morning', hours: 1 };
    S.mode = 'single';
    S.ready = false;
    CAL.rangeStart = null;
    CAL.extraCountries = [];
    session.uid = null;
    session.email = null;
    notify();
}