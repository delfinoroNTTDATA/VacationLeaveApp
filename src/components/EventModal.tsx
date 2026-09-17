import React, { useEffect, useMemo, useState} from "react";
import { 
    Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform,
    AccessibilityAnnouncementFinishedEventHandler
 } from "react-native";
import { S, DayEntry, EventType, EventQty, HalfPeriod, MONTHS_IT, notify } from "../state/appState";
import { saveDayEntries, saveEvents, deleteEvents } from "../state/data";
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
            const mornig = halfEntries.find((e) => e.half === 'morning')!;
            const afternoon = halfEntries.find((e) => e.half === 'afternoon')!;
            setExistingInfo( tn('modal_half_summary', {
                a: describeType(mornig.type) , b: describeType(afternoon.type)
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
                type: describeType(ev.type)
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


    function describeType(ty: EventType) {
        return t(ty === 'leave' ? 't_leave' : ty === 'permit' ? 't_permit' : 't_office');        
    }

    const title = single ? t('m_mark_day') : tn('modal_mark_days', { n: dates.length });

    const subtitle = useMemo(() => {
        if(single) {
            const [y, m, d] = dates[0].split('-');
            return `${d} ${MONTHS_IT[parseInt(m, 10)]} ${y}`;
        }
        const s = [...dates].sort();
        const f = (ds: string) => {
            const [, m, d] = ds.split('-');
            return `${d}/${m}`;
        }
        return s.slice(0,5).map(f).join(', ') + (s.length > 5 ? tn('modal_plus_others', { n: s.length - 5}) : '');
    }, [dates, single]);

    const hoursNum = Math.max(1, parseInt(hours, 10) || 1);
    const hoursEquivText = qty === 'hours' ? tn('hours_equiv', { n: (hoursNum / S.cfg.dayHours).toFixed(2) }) : '';

    async function handleSave() {
        if (!type || dates.length === 0) {
            onClose();
            return;
        }

        const newEntry: DayEntry = {
            type,
            qty: type === 'office' ? 'whole' : (qty ?? 'whole'),
            half: half ?? 'morning',
            hours: hoursNum,
        };

        setBusy(true);
        
        try {
            if (dates.length === 1 && newEntry.qty === 'half') {
                const ds = dates[0];
                const otherHalf = (S.ev[ds] || []).find((e) => e.qty === 'half' && e.half !== newEntry.half);
                await saveDayEntries(ds, otherHalf ? [otherHalf, newEntry] : [newEntry]);
            } else {
                await saveEvents(dates, newEntry)
            }
            onSaved();
        } catch (e: any) {
            Alert.alert(t('err_save') + (e?.message || ''))
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete() {
        if (dates.length === 0) {
            onClose();
            return;
        }
        setBusy(true);

        try {
            await deleteEvents(dates);
            onSaved();
        
        } catch (e: any) {
            Alert.alert(t('err_delete') + (e?.message || ''));
        } finally {
            setBusy(false);
        }
    }

    const activeAccent = type === 'permit' ? colors.permit : colors.leave;
    const activeLight = type === 'permit' ? colors.permitLight : colors.leaveLight;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView 
                style = {styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style = {styles.modal}>
                        <Text style = {styles.title}>{title}</Text>
                        <Text style = {styles.sub}>{subtitle}</Text>

                        {existingInfo ? <Text style = {styles.existing}>{existingInfo}</Text> : null}

                        <View style = {styles.typeRow}>
                            {(['leave', 'permit', 'office'] as EventType[]).map((ty) => {
                                const selected = type === ty; 
                                return (
                                    <TouchableOpacity
                                        key = {ty}
                                        style = {[
                                            styles.typeOpt,
                                            selected && { borderColor: typeColor(ty), backgroundColor: typeLightColor(ty) }
                                        ]}
                                        onPress = {() => setType(type === ty ? null : ty)}
                                        >
                                            <Text style = {styles.typeIco}>{ty === 'leave' ? '🌴' : ty === 'permit' ? '⏰' : '🏢'}</Text>
                                            <Text>
                                                {t(ty === 'leave' ? 't_leave' : ty === 'permit' ? 't_permit' : 't_office')}
                                            </Text>
                                        </TouchableOpacity>
                                )
                            })}                       
                    </View>

                    {type !== 'office' && (
                        <View style = {styles.qtySection}>
                            <Text style = {styles.qtyLabel}>{t('m_duration')}</Text>
                            <View style = {styles.qtyRow}>
                                {([
                                    ['whole' , t('m_full')],
                                    ['half' , t('m_half')],
                                    ['hours' , t('m_hours')]
                                ] as [EventQty, string][]).map(([q, label]) => {
                                    const selected = qty === q;

                                    return(
                                        <TouchableOpacity
                                            key = {q}
                                            style = {[
                                                styles.qtyBtn,
                                                selected && { borderColor: activeAccent, backgroundColor: activeLight }
                                            ]}
                                            onPress = {() => setQty(q)}
                                        >
                                            <Text style = {[
                                                styles.qtyBtnText,
                                                selected && { color: activeAccent }
                                            ]}>{label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            { qty === 'half' && (
                                <View style = {styles.halfRow}>
                                    {(['morning', 'afternoon'] as HalfPeriod[]).map((h) => {
                                        const selected = half === h;
                                        return (
                                            <TouchableOpacity
                                                key = {h}
                                                style = {[
                                                    styles.halfBtn,
                                                    selected && { borderColor: activeAccent, backgroundColor: activeLight }
                                                ]}
                                                onPress = {() => setHalf(h)}
                                            >
                                                <Text
                                                        style = {[
                                                            styles.halfBtnText,
                                                            selected && { color: activeAccent }
                                                        ]}
                                                >
                                                    {t(h === 'morning' ? 'hb_morning' : 'hb_afternoon')}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            { qty === 'hours' && (
                                <View style = {styles.hoursRow}>
                                    <Text style = {styles.hoursLabel}>{t('hours_number_label')}</Text>
                                    <TextInput
                                        style = {styles.hoursInput}
                                        value = {hours}
                                        onChangeText = {setHours}
                                        keyboardType = "number-pad"
                                    />
                                    <Text style = {styles.hoursSuffix}>/ {S.cfg.dayHours}h</Text>
                                </View>
                            )}
                        </View>
                    )}
                    
                    <View style = {styles.btnRow}>
                        <TouchableOpacity style = {styles.btnCancel} onPress = {onClose} disabled = {busy}>
                            <Text style = {styles.btnCancelText}>{t('m_cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style = {styles.btnDel} onPress = {handleDelete} disabled = {busy}>
                            <Text style = {styles.btnDelText}>{t('m_delete')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style = {styles.btnSave} onPress = {handleSave} disabled = {busy}>
                            <Text style = {styles.btnSaveText}>{t('m_save')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );

}

const styles = StyleSheet.create({
    overlay: {
        flex: 1, 
        backgroundColor: 'rgba(28,25,23,0.55)', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 20 
    },

    modal: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        color: colors.text,
        marginBottom: 2,
    },

    title: {
        fontFamily: 'serif',
        fontSize: 19,
        color: colors.text,
        marginBottom: 2
    },

    sub: {
        fontSize: 12,
        color: colors.muted,
        marginBottom: 8
    },

    existing: {
        fontSize: 12,
        color: colors.text,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 10,
        marginBottom: 14
    },

    typeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16
    },

    typeOpt: {
        flex: 1,
        backgroundColor: colors.surface2,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center'
    },

    typeIco: {
        fontSize: 20,
        marginBottom: 4
    },

    typeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.muted
    },

    qtySection: {
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 14,
        marginBottom: 16
    },

    qtyLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        color: colors.muted,
        marginBottom: 10
    },

    qtyRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8
    },

    qtyBtn: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 8,
        paddingVertical: 9,
        alignItems: 'center'
    },

    qtyBtnText: {
        fontSize: 12,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 8,
        paddingVertical: 9,
        alignItems: 'center',
    },

    halfRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8
    },

    halfBtn: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 8,
        paddingVertical: 9,
        alignItems: 'center'
    },

    halfBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.muted
    },

    hoursRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8
    },

    hoursLabel: {
        fontSize: 12,
        color: colors.muted,
    },

    hoursInput: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 7,
        paddingHorizontal: 10,
        fontSize: 14,
        color: colors.text,
        width: 60,
        textAlign: 'center',
    },

    hoursSuffix: {
        fontSize: 12,
        color: colors.muted,
    },

    hoursNote: {
        fontSize: 11,
        color: colors.muted,
        marginTop: 7
    },

    btnRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4
    },

    btnCancel: {
        flex: 1,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 9,
        paddingVertical: 11,
        alignItems: 'center'
    },

    btnCancelText: {
        color: colors.muted,
        fontWeight: '600',
        fontSize: 13
    },

    btnDel: {
        flex: 1,
        backgroundColor: colors.dangerLight,
        borderRadius: 9,
        paddingVertical: 11,
        alignItems: 'center'
    },

    btnDelText: {
        color: colors.danger,
        fontWeight: '600',
        fontSize: 13
    },

    btnSave: {
        flex: 1,
        backgroundColor: colors.text,
        borderRadius: 9,
        paddingVertical: 11,
        alignItems: 'center'
    },

    btnSaveText: {
        color: colors.bg,
        fontWeight: '700',
        fontSize: 13
    }
});