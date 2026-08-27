import { 
    doc, collection, setDoc, 
    deleteDoc, getDocs, onSnapshot, 
    writeBatch, Unsubscribe
 } from 'firebase/firestore';
 import { db, evRef, cfgRef, amountCORef } from "../firebase";
 import { S, DayEntry, EventType, EventQty, HalfPeriod, session, notify } from "../state/appState";

 let unsubEvents : Unsubscribe | null = null;

 export async function loadConfig(): Promise<void> {
    try {
        const snap = await getDocs(collection(db, 'users', session.uid as string, 'config'))
        snap.forEach((d) => {
            if(d.id === 'main') S.cfg = Object.assign({}, S.cfg, d.data());
        });
    } catch (e) {
        console.warn('loadConfig error', e);
    }
 }

 export async function saveConfig(): Promise<void> {
    if(!session.uid) return;

    try {
       await setDoc(cfgRef(), { ...S.cfg }) 
    } catch (e) {
        console.warn(e);
    }
 }

 export async function loadAmountCarriedOver(): Promise<void> {
    try {
        const snap = await getDocs(amountCORef());

        S.amountCOManual = {};

        snap.forEach((d) => {
            S.amountCOManual[d.id] = d.data() as { leaveHours: number, permitHours: number};
        });

        if(!S.amountCOManual['2025']) {
            S.amountCOManual['2026'] = { leaveHours: 29, permitHours: 42 };
            await setDoc(doc(amountCORef(), '2026'), {leaveHours: 29, permitHours: 42});
        }
    } catch (e) {
        console.warn('loadAmountCarried error', e);
    }
 }

 export function startEventsListener(onUpdate? : () => void): void {
    if(unsubEvents) unsubEvents();

    unsubEvents = onSnapshot(
        evRef(),
        { includeMetadataChanges: false },
        (snap: any) => {
            const newEvent: Record<string, DayEntry[]> = {};
            
            snap.forEach((d: any): void => {
                const data: Record<string, any> = d.data() as any;
                let entries: DayEntry[];

                if(Array.isArray(data.entries)) {
                    entries = data.entries.map((e: any) => ({
                        type: (e.type || 'leave') as EventType,
                        qty: (e.qty || 'whole') as EventQty,
                        half: (e.half || 'morning') as HalfPeriod,
                        hours: Number(e.hours) || 0
                    }))
                } else if(data.type) {
                    entries = [{
                        type: (data.type || 'leave') as EventType,
                        qty: (data.qty || 'whole') as EventQty,
                        half: (data.half || 'morning') as HalfPeriod,
                        hours: Number(data.hours) || 8,
                    }]
                } else {
                    return;
                }

                if(entries.length > 0) newEvent[d.id] = entries;
            });

            if (snap.size > 0 || !snap.metadata.fromCache ) S.ev = newEvent;
            notify();
            if(typeof onUpdate === 'function') onUpdate();
        },
        (err) => console.warn('snapshot error', err)
    );
 }

 export function stopEventListener(): void {
    if(unsubEvents) {
        unsubEvents();
        unsubEvents = null;
    }
 }

 export async function saveEvents(dates: string[], evObj: DayEntry): Promise<void> {
    const batch = writeBatch(db);
    dates.forEach((ds) => batch.set(doc(evRef(), ds), { entries: [evObj] }));
    await batch.commit();
 }
 export async function deleteEvents(dates: string[]): Promise<void> {
    const batch = writeBatch(db);
    dates.forEach((ds) => batch.delete(doc(evRef(), ds)))
    await batch.commit();
 }

 export async function saveAnountCarriedOver(yr: string, leaveHours: number, permitHours: number): Promise<void> {
    S.amountCOManual[yr] = {leaveHours, permitHours};
    await setDoc(doc(amountCORef(), yr), {leaveHours, permitHours})
 }

export async function removeAmountCarriedOver(yr: string) {
    delete S.amountCOManual[yr];
    await deleteDoc(doc(amountCORef(), yr));
}

export async function clearAllEvents(): Promise<void> {
    const snap = await getDocs(evRef());
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
}