import React, { useMemo, useState } from "react";
import {
    View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, TextInput, Alert
} from 'react-native';
import { S, useAppVersion, notify } from "../state/appState";
import { calcStats, ftm2 } from "../lib/calc";
import {
    saveConfig, saveAnountCarriedOver, removeAmountCarriedOver, clearAllEvents
} from '../state/data';
import { t } from "../lib/i18n";
import { colors, radius } from "../theme/colors";
import Header from "../components/Header";

function NumRow({
    label, sub, value, onDec, onInc
}: {label: string; sub: string; value: number; onDec: () => void; onInc: () => void }) {
   return (
        <View style = {styles.setRow}>
            <View style = {{ flex: 1}}>
                <Text style = {styles.setLbl}>{label}</Text>
                <Text style = {styles.setSub}>{sub}</Text>
            </View>

            <View style = {styles.numCtrl}>
                <TouchableOpacity style = {styles.numBtn} onPress = {onDec}>
                    <Text style = {styles.numBtnText}>&#8722;</Text>
                </TouchableOpacity>

                <Text style = {styles.numVal}>{value}</Text>

               <TouchableOpacity style = {styles.numBtn} onPress = {onInc}>
                    <Text style = {styles.numBtnText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
   ) 
}

export default function SettingsScreen() {
    useAppVersion();

    const [manYear, setManYear] = useState(String(S.cfg.year));
    const [manLeaveHours, setManLeaveHours] = useState('0');
    const [manPermitHours, setManPermitHours] = useState('0');

    function adj(key: 'leaveTotal' | 'permitHours' | 'dayHours' | 'year', delta: number) {
        (S.cfg as any)[key] = Math.max(0, S.cfg[key] + delta);
        notify();
        saveConfig();
    }

    function adjR(key: 'maxACOLeave' | 'maxACOPermit' | 'monthDeadline', delta: number) {
        (S.cfg as any)[key] = Math.max(0, S.cfg[key] + delta);
        notify();
        saveConfig();
    }

    function onToggleACO(checked: boolean){
        S.cfg.aCOEnabled = checked;
        notify();
        saveConfig();
    }

    const manYears = useMemo(() => {
        const yr = S.cfg.year;
        return [yr - 2, yr - 1, yr, yr + 1].filter((y) => y > 2000);
    }, [S.cfg.year])

    function onManYearChange(yr: string) {
        setManYear(yr);
        
        const m = S.amountCOManual[yr] || { leaveHours: 0, permitHours: 0};
        
        setManLeaveHours(String(m.leaveHours));
        setManPermitHours(String(m.permitHours));
    }

    async function handleSaveCarryover() {
        const lHours = parseFloat(manLeaveHours) || 0;
        const pHours = parseFloat(manPermitHours) || 0;

        try {
            await saveAnountCarriedOver(manYear, lHours, pHours);
            notify();
        } catch (e: any) {
            Alert.alert(t('set_error_prefix') + (e?.massage || ''))
        }
    }

    async function handleRemoveCarryover(yr: string) {
        try {
            await removeAmountCarriedOver(yr);
            notify();
        } catch (e: any) {
            Alert.alert(t('set_error_prefix') + (e?.message || ''))
        }
    }

    function handleClearAll() {
        Alert.alert(t('set_clear_events_lbl'), t('set_confirm_clear'), [
            { text: t('m_cancel'), style: 'cancel'},
            {
                text: t('set_reset_btn'),
                style: 'destructive',
                onPress: async () => {
                    await clearAllEvents();
                    notify();
                }
            }
        ]);
    }
    const manualEntries = Object.entries(S.amountCOManual || {})
    .filter(([, v]) => v.leaveHours > 0 || v.permitHours > 0)
    .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10));

    const historyYear = useMemo(() => {
        const yE = Object.keys(S.ev).map((k) => parseInt(k.slice(0, 4), 10));
        const yR = Object.keys(S.amountCOManual || {}).map((k) => parseInt(k, 10));
    
        return [... new Set([...yE, ...yR])].sort((a, b) => a-b);
    }, [S.ev, S.amountCOManual]);

    return (
        <View style = {styles.screen}>
            <Header/>
            <ScrollView contentContainerStyle = {styles.scroll}>
                <View style = {styles.card}>
                    <Text style = {styles.cardTitle}>{t('set_annual')}</Text>
                    <NumRow label = {t('set_leave_tot')} sub = {t('set_leave_days_sub')} value = {S.cfg.leaveTotal} onDec = {() => adj('leaveTotal', -1)} onInc = {() => adj('leaveTotal', 1)} />
                    <NumRow label = {t('set_perm_ore')} sub = {t('set_permit_hours_sub')} value = {S.cfg.permitHours} onDec = {() => adj('permitHours', -4)} onInc = {() => adj('permitHours', 4)} />
                    <NumRow label = {t('set_day_hours')} sub = {t('set_day_hours_sub')} value = {S.cfg.dayHours} onDec = {() => adj('dayHours', -1)} onInc = {() => adj('dayHours', 1)} />
                    <NumRow label = {t('set_year')} sub = {t('set_year_sub')} value = {S.cfg.year} onDec = {() => adj('year', -1)} onInc = {() => adj('year', 1)} />
                    <View style = {[styles.setRow, { borderBottomWidth: 0 }]}>
                        <View style = {{ flex: 1}}>
                            <Text style = {styles.setLbl}>{t('set_country')}</Text>
                            <Text style = {styles.setSub}>{t('set_lang_holidays_sub')}</Text>
                        </View>
                    </View>
                </View>

                <View style = {styles.card}>
                    <Text style = {styles.cardTitle}>&#128197; {t('set_manual_carryover_title')}</Text>
                    <Text style = {styles.cardDesc}>{t('set_manual_carryover_desc')}</Text>

                    <View style = {styles.carryFormRow}>
                        <View style = {styles.fg}>
                            <Text style = {styles.fgLabel}>{t('rpt_year_label')}</Text>
                            <View style = {styles.yearSelectChip}>
                                {manYears.map((y) => (
                                    <TouchableOpacity
                                        key = {y}
                                        style = {[styles.yearSelectChip, manYear === String(y) && styles.yearSelectChipActive]}
                                        onPress = {() => onManYearChange(String(y))}
                                    >
                                        <Text style = {[styles.yearSelectChipText, manYear === String(y) && styles.yearSelectChipActive]}>{y}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style = {styles.carryInputsRow}>
                        <View style = {styles.fg}>
                            <Text style = {styles.fgLabel}>{t('set_leave_hours_word')}</Text>
                            <TextInput style = {styles.fgInput} value = {manLeaveHours} onChangeText = {setManLeaveHours} keyboardType = "numeric" />
                        </View>

                        <View style = {styles.fg}>
                            <Text style = {styles.fgLabel}>{t('set_permit_hours_word')}</Text>
                            <TextInput style = {styles.fgInput} value = {manPermitHours} onChangeText = {setManPermitHours} keyboardType = "numeric" />
                        </View>

                        <TouchableOpacity style = {styles.btnRun} onPress = {handleSaveCarryover}>
                            <Text style = {styles.btnRunText}>{t('set_save_carryover')}</Text>
                        </TouchableOpacity>
                    </View>

                    {manualEntries.length === 0 ? (
                        <Text style = {styles.mutedNote}>{t('set_no_manual_carryover')}</Text>
                    ) : (
                        <View style = {styles.table}>
                            <View style = {styles.tableHeaderRow}>
                                <Text style = {[styles.th, { flex: 1 }]}>{t('rpt_year_label')}</Text>
                                <Text style = {[styles.th, { flex: 1.4 }]}>{t('set_leave_hours_word')}</Text>
                                <Text style = {[styles.th, { flex: 1 }]}>{t('set_permit_hours_word')}</Text>
                                <Text style = {[styles.th, { flex: 0.8 }]} />
                            </View>

                            {manualEntries.map(([y, v]) => (
                                <View key = {y} style = {styles.tableRow}>
                                    <Text style = {[styles.td, { flex: 1, fontWeight: '700'}]}>{y}</Text>
                                    <Text style = {[styles.td, { flex: 1.4 }]}>{v.leaveHours}h ({ftm2(v.leaveHours / S.cfg.dayHours)}gg)</Text>
                                    <Text style = {[styles.td, { flex: 1}]}>{v.permitHours}h</Text>
                                    <TouchableOpacity style = {{ flex: 0.8}} onPress = {() => handleRemoveCarryover(y)}>
                                        <Text style = {styles.tdDelete}>{t('m_delete')}</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style = {styles.card}>
                    <Text style = {styles.cardTitle}>&#128257; {t('set_auto_carryover_title')}</Text>

                    <View style = {styles.setRow}>
                        <View style = {{ flex: 1 }}>
                            <Text style = {styles.setLbl}>{t('set_auto_carryover_lbl')}</Text>
                            <Text style = {styles.setSub}>{t('set_auto_carryover_sub')}</Text>
                        </View>

                        <View style = {{ alignItems: 'flex-end', gap: 4}}>
                            <Switch value = {S.cfg.aCOEnabled} onValueChange={onToggleACO} trackColor={{ true: colors.leave }} />
                            <Text style = {styles.toggleLabel}>{S.cfg.aCOEnabled ? t('set_enabled') : t('set_disabled')}</Text>
                        </View>
                    </View>

                    {S.cfg.aCOEnabled && (
                        <View style = {styles.acoRules}>
                            <Text style = {styles.acoRulesTitle}>{t('set_carryover_rules_title')}</Text>
                            <NumRow label = {t('set_limit_leave_lbl')} sub = {t('set_no_limit')} value = {S.cfg.maxACOLeave} onDec = {() => adjR('maxACOLeave', -1)} onInc = {() => adjR('maxACOLeave', 1)} />
                            <NumRow label = {t('set_limit_permit_lbl')} sub = {t('set_no_limit')} value = {S.cfg.maxACOPermit} onDec = {() => adjR('maxACOPermit', -4)} onInc = {() => adjR('maxACOPermit', 4)} />
                            <NumRow label = {t('set_dedline_lbl')} sub = {t('set_no_deadline')} value = {S.cfg.monthDeadline} onDec = {() => adjR('monthDeadline', -1)} onInc = {() => adjR('monthDeadline', 1)} />     
                        </View>
                    )}
                </View>

                <View style = {styles.card}>
                    <Text style = {styles.cardTitle}>&#128200; {t('set_years_history_title')}</Text>

                    {historyYear.length === 0 ? (
                        <Text style = {styles.mutedNote}>{t('set_no_years')}</Text>
                    ) : (
                        <View style = {styles.table}>
                            <View style = {styles.tableHeaderRow}>
                                <Text style = {[styles.th, { flex: 0.7}]}>{t('rpt_year_label')}</Text>
                                <Text style = {[styles.th, { flex: 1.6}]}>{t('set_col_leave_used')}</Text>
                                <Text style = {[styles.th, { flex: 1.6}]}>{t('set_col_permit_used')}</Text>
                            </View>

                            {historyYear.map((y) => {
                                const st = calcStats(y);
                                const riL = st.amountCarriedOver.leaveDays;
                                const riP = st.amountCarriedOver.permitHours;

                                return (
                                    <View key = {y} style = {styles.tableRow}>
                                        <Text style = {[styles.td, { flex: 0.7, fontWeight: '700'}]}>{y}</Text>
                                        <View style = {{ flex: 1.6 }}>
                                            <Text style = {styles.td}>{st.leaveCons}gg / {st.leaveTotalYearly}gg {riL > 0 ? `(+${riL}gg)` : ''}</Text>
                                            <Text style = {st.leaveACO > 0 ? styles.tdAco : styles.tdZero}>
                                                {st.leaveACO > 0 ? `${t('set_col_residual')}: +${st.leaveACO}gg` : `${t('set_col_residual')}: -`}
                                            </Text>
                                        </View>

                                        <View style = {{ flex: 1.6}}>
                                            <Text style = {styles.td}>{st.permitHours}h / {st.permitTotalYearly}h {riP > 0 ? `(+${riP}h)` : ''}</Text>
                                            <Text style = {st.permitHourACO > 0 ? styles.tdAco : styles.tdZero }>
                                                {st.permitHourACO > 0 ? `${t('set_col_residual')}: +${st.permitHourACO}h` : `${t('set_col_residual')}: -`}
                                            </Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    )}
                </View>

                <View style = {styles.card}>
                    <Text style = {styles.cardTitle}>&#128465; {t('set_data_mgmt_title')}</Text>

                    <View style = {[styles.setRow, { borderBottomWidth: 0}]}>
                        <View style = {{ flex: 1 }}>
                            <Text style = {styles.setLbl}>{t('set_clear_events_lbl')}</Text>
                            <Text style = {styles.setSub}>{t('set_clear_events_sub')}</Text>
                        </View>
 
                        <TouchableOpacity style = {styles.btnDanger} onPress = {handleClearAll}>
                            <Text style = {styles.btnDangerText}>{t('set_reset_btn')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  cardDesc: { fontSize: 12, color: colors.muted, marginBottom: 14 },
  setRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  setLbl: { fontSize: 13, fontWeight: '600', color: colors.text },
  setSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  numCtrl: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  numBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface2,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  numBtnText: { fontSize: 16, color: colors.text },
  numVal: { fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 32, textAlign: 'center' },
  toggleLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  acoRules: { backgroundColor: colors.surface2, borderRadius: radius.sm, padding: 10, marginTop: 10 },
  acoRulesTitle: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 },
  carryFormRow: { marginBottom: 10 },
  carryInputsRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap' },
  fg: { minWidth: 90 },
  fgLabel: { fontSize: 11, color: colors.muted, marginBottom: 4, fontWeight: '600' },
  fgInput: {
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 7,
    paddingVertical: 9, paddingHorizontal: 12, fontSize: 14, color: colors.text, textAlign: 'center', width: 90,
  },
  yearSelectRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  yearSelectChip: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 7, paddingVertical: 8, paddingHorizontal: 12 },
  yearSelectChipActive: { backgroundColor: colors.text, borderColor: colors.text },
  yearSelectChipText: { fontSize: 12, color: colors.text, fontWeight: '600' },
  yearSelectChipTextActive: { color: colors.bg },
  btnRun: { backgroundColor: colors.text, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, justifyContent: 'center' },
  btnRunText: { color: colors.bg, fontWeight: '700', fontSize: 12 },
  mutedNote: { fontSize: 12, color: colors.muted },
  table: { marginTop: 4 },
  tableHeaderRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  th: { fontSize: 10, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  td: { fontSize: 12, color: colors.text },
  tdAco: { fontSize: 10, color: colors.aco, marginTop: 2, fontWeight: '600' },
  tdZero: { fontSize: 10, color: colors.muted, marginTop: 2 },
  tdDelete: { fontSize: 11, color: colors.danger, fontWeight: '700' },
  btnDanger: { backgroundColor: colors.dangerLight, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 16 },
  btnDangerText: { color: colors.danger, fontWeight: '700', fontSize: 12 },
});
