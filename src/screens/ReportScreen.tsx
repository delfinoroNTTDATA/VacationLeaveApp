import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { S, DayEntry, useAppVersion } from "../state/appState";
import { eventHours, day, ftm2 } from "../lib/calc";
import { t, tn, monthNames } from "../lib/i18n";
import { colors, radius, typeColor } from "../theme/colors";
import Header from "../components/Header";

function flattenEv(evObj: Record<string, DayEntry[]>): [string, DayEntry][] {
    return Object.entries(evObj).flatMap(([k, entries]) => entries.map((ev) => [k, ev] as [string, DayEntry]));
}

function fmtDay(ds: string, ev: DayEntry): string {
    const [, m, d] = ds.split('-');
    let note = '';

    if (ev.type !== 'office') {
        if (ev.qty === 'half') note = t(ev.half === 'morning' ? 'm_morning_short' : 'm_afternoon_short' );
        else if (ev.qty === 'hours') note = `${ev.hours}h`;
    }

    return `${d}/${m} ${note}`.trim();
}

interface MonthBlock {
    m: number;
    label: string;
    leave: [string, DayEntry][];
    permit: [string, DayEntry][];
    office: [string, DayEntry][];
    lGG: number;
    oL: number;
    pGG: number;
    oP: number;
}

export default function ReportScreen() {
    useAppVersion();
    
    const yr = S.cfg.year;
    const allYear = useMemo(() => (
        [...new Set([yr - 2, yr - 1, yr, yr + 1, ...Object.keys(S.ev).map((k) => parseInt(k.slice(0, 4), 10))])]
            .sort((a, b) => b - a)
    ), [yr, S.ev]);

    const [selYears, setSelYears] = useState<number[]>([yr]);
    const [selMonths, setSelMonths] = useState<number[]>(Array.from({ length: 12 }, (__, i) => i + 1));
    const [generated, setGenerated] = useState(false);

    function toggleYear(y: number) {
        setSelYears((prev) => (prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]));
        setGenerated(false);
    }

    function toggleMonth(m: number) {
        setSelMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
        setGenerated(false);
    }

    function selAllMonths(all: boolean) {
        setSelMonths( all ? Array.from({ length: 12 }, (_,i) => i + 1) : []);
        setGenerated(false);
    }
    
    const yearBlocks = useMemo(() => {
        if(!generated) return [];
        return selYears.map((y) =>{
            const evYear = flattenEv(S.ev).filter(([k]) => k.startsWith(String(y) + '-')).sort(([a], [b]) => a.localeCompare(b));
            let totLGG = 0; let totLH = 0; let totPGG = 0; let totPH = 0; let totO = 0;

            const blocks: MonthBlock[] = selMonths.sort((a, b) => a - b).map((m) => {
                const mm = String(m).padStart(2, '0');
                const evM = evYear.filter(([k]) => k.slice(5, 7) === mm);
                const leave = evM.filter(([, ev]) => ev.type === 'leave');
                const permit = evM.filter(([, ev]) => ev.type === 'permit');
                const office = evM.filter(([, ev]) => ev.type === 'office');
                const oL = leave.reduce((a, [, ev]) => a + eventHours(ev), 0);
                const oP = permit.reduce((a, [, ev]) => a + eventHours(ev), 0);
                const lGG = day(oL); const pGG = day(oP);

                totLGG += lGG; totLH += oL; totPGG += pGG; totPH += oP; totO += office.length;
                
                return { m, label: monthNames()[m-1], leave, permit, office, lGG, oL, pGG, oP };
            });

            return { year: y, blocks, totLGG: ftm2(totLGG), totLH: ftm2(totLH), totPGG: ftm2(totPGG), totPH: ftm2(totPH), totO };
        });
    }, [generated, selYears, selMonths, S.ev]);

    async function doExcel() {
        if (selYears.length === 0 || selMonths.length === 0) return;

        const wb = XLSX.utils.book_new();

        selYears.forEach((y) => {
            const evL = flattenEv(S.ev).filter(
                ([k]) => k.startsWith(String(y) + '-') && selMonths.includes(parseInt(k.slice(5,7), 10))
            ).sort(
                ([a], [b]) => a.localeCompare(b)
            );

            const rows : (string | number)[][] = [[t('rpt_col_month'), t('rpt_col_date'), t('m.type'), t('m_duration'), t('rpt_col_detail'), t('m_hours')]];

            evL.forEach(([k, ev]) => {
                const [, m, d] = k.split('-');
                const month = monthNames()[parseInt(m, 10) - 1];
                const dur = ev.type === 'office' ? t('m_full') : ev.qty === 'half' ? t('m_half') : ev.qty === 'hours' ? t('m_hours') : t('m_full');
                const det = ev.qty === 'half' ? t(ev.half === 'morning' ? 'hb_mornig' : 'hb_afternoon') : ev.qty === 'hours' ? `${ev.hours}h` : '';

                rows.push([month, `${d}/${m}/${y}`, t(ev.type === 'leave' ? 't_leave' : ev.type === 'permit' ? 't_permit' : 't_office'), dur, det, eventHours(ev)]);
            });
            
            const ws = XLSX.utils.aoa_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, String(y));
        });

        const label = selYears.length > 1 ? `${selYears[selYears.length - 1]}-${selYears[0]}` : String(selYears[0]);
        const fileName = `leave_${label}_report.xlsx`;

        try {
            const wbBase64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx'});
            const dir = FileSystem.cacheDirectory;

            if (!dir) throw new Error('cacheDirectory unavailable');

            const uri = dir + fileName;

            await FileSystem.writeAsStringAsync(uri, wbBase64, { encoding: 'base64'});

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: fileName
                });
            } else {
                Alert.alert(fileName, uri);
            }
            
        } catch (e: any) {
            Alert.alert(t('err_save') + (e?.message || ''));
        }
    }

    return (
        <View style = {styles.screen}>
            <Header/>

            <ScrollView contentContainerStyle = {styles.scroll}>
                <Text style = {styles.fieldLabel}>{t('rpt_year_label')}</Text>
                <View style = {styles.chipRow}>
                    {allYear.map((y) => (
                        <TouchableOpacity
                            key = {y}
                            style = {[styles.yearChip, selYears.includes(y) && styles.chipActive]}
                            onPress = {() => toggleYear(y)}
                        >
                            <Text style = {[styles.chipText, selYears.includes(y) && styles.chipTextActive ]}>{y}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style = {styles.fieldLabel}>{t('rpt_months')}</Text>

                <View style = {styles.chipRow}>
                    {monthNames().map((name, i) => (
                        <TouchableOpacity
                            key = {i}
                            style = {[styles.monthChip, selMonths.includes(i + 1) && styles.chipActive]}
                            onPress = {() => toggleMonth(i + 1)}
                        >
                            <Text style = {[styles.chipText, selMonths.includes(i + 1) && styles.chipTextActive]}>{name.slice(0, 3)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style = {styles.chipRow}>
                    <TouchableOpacity style = {styles.smallBtn} onPress = {() => selAllMonths(true)}>
                        <Text style = {styles.smallBtnText}>{t('rpt_none')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = {styles.smallBtn} onPress = {() => selAllMonths(false)}>
                        <Text style = {styles.smallBtnText}>{t('rpt_none')}</Text>
                    </TouchableOpacity>
                </View>

                <View style = {styles.actionRow}>
                    <TouchableOpacity style = {styles.btnRun} onPress = {() => setGenerated(true)}>
                        <Text style = {styles.btnRunText}>&#9654; {t('rpt_generate')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = {styles.btnExcel} onPress = {doExcel}>
                        <Text style = {styles.btnExcelText}>&#11015; Excel</Text>
                    </TouchableOpacity>
                </View>

                {generated && selYears.length === 0 && (
                    <Text style = {styles.emptyMsg}>&#128197; {t('rpt_select_year')}</Text>
                )}

                {generated && selYears.length > 0 && selMonths.length === 0 && (
                    <Text style = {styles.emptyMsg}>&#128197; {t('rpt_select_month')}</Text>
                )}

                {yearBlocks.map(({year, blocks, totLGG, totLH, totPGG, totPH, totO }) => (
                    <View key = {year} style = {styles.yearBlock}>
                        {selYears.length > 1 && <Text style = {styles.yearHeading}>{tn('rpt_year_heading', {yr: year })}</Text>}

                        <View style = {styles.totalsRow}>
                            <View style = {styles.totalItem}>
                                <Text style = {[styles.totalVal, { color: typeColor('leave')}]}>{totLGG}gg</Text>
                                <Text style = {styles.totalLbl}>{t('rpt_leave_tot')} ({totLH}h)</Text>
                            </View>

                            <View style = {styles.totalItem}>
                                <Text style = {[styles.totalVal, { color: typeColor('permit')}]}>{totPGG}gg</Text>
                                <Text style = {styles.totalLbl}>{t('rpt_perm_tot')} ({totPH}h)</Text>
                            </View>

                            <View style = {styles.totalItem}>
                                <Text style = {[styles.totalVal, { color: typeColor('office')}]}>{totO}</Text>
                                <Text style = {styles.totalLbl}>{t('rpt_office')}</Text>
                            </View>
                        </View>

                        {blocks.map((b) => (
                            <View key = {b.m} style = {styles.monthBlock}>
                                <View style = {styles.monthHeader}>
                                    <Text style = {styles.monthName}>{b.label} {year}</Text>
                                    <View style = {styles.monthBadges}>
                                        {b.leave.length > 0 && <Text style = {styles.badgeLeave}>🌴 {b.lGG}gg ({ftm2(b.oL)}h)</Text>}
                                        {b.permit.length > 0 && <Text style = {styles.badgePermit}>⏰ {b.pGG}gg ({ftm2(b.oP)}h)</Text>}
                                        {b.office.length > 0 && <Text style = {styles.badgeOffice}>🏢 {b.office.length}gg</Text>}
                                        {!b.leave.length && !b.permit.length && !b.office.length && (
                                            <Text style = {styles.noEvent}>{t('rpt_no_event')}</Text>
                                        )}
                                    </View>
                                </View>

                                {[
                                    { arr: b.leave, ico: '🌴', type: 'leave' as const},
                                    { arr: b.permit, ico: '⏰', type: 'permit' as const},
                                    { arr: b.office, ico: '🏢', type: 'office' as const}
                                ].filter((r) => r.arr.length > 0).map((r) => (
                                    <View key = {r.type} style = {styles.typeRow}>
                                        <Text style = {styles.typeIco}>{r.ico}</Text>

                                        <View style = {{ flex: 1 }}>
                                            <Text style = {styles.typeLabel}>
                                                {t(r.type === 'leave' ? 't_leave' : r.type === 'permit' ? 't_permit' : 't_office')}
                                            </Text>

                                            <View style = {styles.chipsWrap}>
                                                {r.arr.map(([k, ev], i) => (
                                                    <View key = {i} style = {[styles.dayChip, {backgroundColor: typeColor(r.type)}]}>
                                                        <Text style = {styles.dayChipText}>{fmtDay(k, ev)}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: colors.muted, marginBottom: 8, marginTop: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  yearChip: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  monthChip: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  chipTextActive: { color: colors.bg },
  smallBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  smallBtnText: { fontSize: 11, color: colors.leave, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 8 },
  btnRun: { flex: 1, backgroundColor: colors.text, borderRadius: 9, paddingVertical: 12, alignItems: 'center' },
  btnRunText: { color: colors.bg, fontWeight: '700', fontSize: 13 },
  btnExcel: { flex: 1, backgroundColor: colors.office, borderRadius: 9, paddingVertical: 12, alignItems: 'center' },
  btnExcelText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyMsg: { textAlign: 'center', color: colors.muted, marginTop: 20, fontSize: 13 },
  yearBlock: { marginTop: 18 },
  yearHeading: { fontFamily: 'serif', fontSize: 17, color: colors.text, marginBottom: 10 },
  totalsRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 14, justifyContent: 'space-around' },
  totalItem: { alignItems: 'center' },
  totalVal: { fontSize: 18, fontWeight: '700' },
  totalLbl: { fontSize: 10, color: colors.muted, marginTop: 2, textAlign: 'center' },
  monthBlock: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 10 },
  monthHeader: { marginBottom: 8 },
  monthName: { fontWeight: '700', fontSize: 14, color: colors.text, marginBottom: 6 },
  monthBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeLeave: { fontSize: 11, color: typeColor('leave') },
  badgePermit: { fontSize: 11, color: typeColor('permit') },
  badgeOffice: { fontSize: 11, color: typeColor('office') },
  noEvent: { fontSize: 11, color: colors.muted },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  typeIco: { fontSize: 14 },
  typeLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, marginBottom: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dayChip: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  dayChipText: { fontSize: 10, color: '#fff', fontWeight: '600' },
});