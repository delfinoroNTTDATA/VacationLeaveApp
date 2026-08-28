import React, { useEffect, useMemo, useState} from "react";
import { 
    Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform,
    AccessibilityAnnouncementFinishedEventHandler
 } from "react-native";
import { S, DayEntry, EventType, EventQty, HalfPeriod, MONTHS_IT, notify } from "../state/appState";
import { saveDayEntries, saveEvents, } from "../state/data";
import { t, tn, monthNames} from "../lib/i18n";
import { colors, radius, typeColor, typeLightColor } from "../theme/colors";

interface EventMoadalProps {
    visible: boolean;
    dates: string[];
    onClose: () => void;
    onSaved: () => void;
}

export default function EventModal({ visible, dates, onClose, onSaved}: EventMoadalProps) {
    const [type, setType] = useState<EventType | null>(null);
    const [qty, setQty] = useState<EventQty | null>(null);
    const [half, setHalf] = useState<HalfPeriod | null>(null);
    const [hours, setHours] = useState('1');
    const [existingInfo, setExistingInfo] = useState('');
    const [busy, setBusy] = useState(false);

    const single = dates.length === 1;
    const existing = single ? S.ev[dates[0]] || [] : [];

    useEffect(() => {
        if (!visible) return;
        const halfEntries = existing.filter((e) => e.qty === 'half');

        if(halfEntries.length === 2){
            const mornig = halfEntries.find((e) => e.half === 'morning');
            const afternoon = halfEntries.find((e) => e.half === 'afternoon');
            setExistingInfo( tn('modal_half_summary', {
                a: describeType(mornig?.type) , b: describeType(afternoon?.type)
            }));
            setType(mornig?.type);
            setQty('half');
            setHalf('morning');
            setHours('1');
        } else if (halfEntries.length === 1) {
            const ev = halfEntries[0];
            const missingHalf: HalfPeriod = ev.half === 'morning' ? 'afternoon' : 'morning';
            setExistingInfo(tn('modal_half_existing',{
                half: t(ev.half === 'morning' ? 'hb_morning' : 'hb_afternoon'),
                type: describeType(ev.type);
            }));
            setType(null);
            setQty('half');
            setHalf(missingHalf);
            setHours('1');
        } else {
            const firstEv: DayEntry | undefined = existing[0];
            setExistingInfo('');
            setType(firstEv?.type ?? null);
            setQty(firstEv?.qty ?? 'whole');
            setHalf(firstEv?.half ?? 'morning');
            setHours(String(firstEv?.hours ?? 1));
        }
    }, [visible, dates.join(',')]);

    

}