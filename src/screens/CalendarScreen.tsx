import React, { useMemo , useState } from "react";
import {
     View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, FlatList, Switch 
    } from "react-native";
import { S, CAL, MONTHS_IT, useAppVersion, notify } from "../state/appState";
import {
    holidayForYear, holidayName, extraHolidayFor, clearHolidayCache, rangeDays, currentCountry, COUNTRY_FLAG, countryName
} from '../lib/holiday';
import { calcStats } from "../lib/calc";
import { t, tn, monthNames, currentLang } from "../lib/i18n";
import { colors, radius, typeColor } from "../theme/colors";
import Header from "../components/Header";
import EventModal from "../components/EventModal";
import { CountryCode } from "../lib/locales";

function pad(n: number) {
    return String(n).padStart(2,'0');
}

export default function CalendarScreen() {
    useAppVersion();
    const now = new Date();
    const [vy, setVy] = useState(now.getFullYear());
    const [vm, setVm] = useState(now.getMonth());
    const [mode, setMode] = useState<'single' | 'range'>('single');
    const [selDates, setSelDates] = useState<string[]>([]);
    const [rangeStart, setRangeStart] = useState<string | null>(null);
    const [monthPickerOpen, setMonthPickerOpen] = useState(false);
    const [countryPickeOpen, setCountryPickerOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalDates, setModalDates] = useState<string[]>([]);

    const lang = currentLang();
    const stats = calcStats(S.cfg.year);

    function clearMultiSelection() {
        setSelDates([]);
        setRangeStart(null);
    }
    
    function shitfMonth(d: number) {
        let m = vm + d;
        let y = vy;
        
        if(m < 0) { m = 11; y--; }
        if(m > 11) { m = 0; y++; }

        setVm(m); setVy(y);
        clearMultiSelection();
    }

    function goToday() {
        setVy(now.getFullYear());
        setVm(now.getMonth())
        clearMultiSelection();
    }

    function toogleOption(opt: 'we' | 'leave') {
        if (opt === 'we') CAL.inclWE = !CAL.inclWE;
        else CAL.exclLeave = !CAL.exclLeave;

        clearHolidayCache();
        clearMultiSelection();
        notify();
    }

    function setSelMode(m: 'single' | 'range') {
        setMode(m);
        clearMultiSelection();
    }

    function openMarkModal(dates: string[]) {
        setModalDates(dates);
        setModalOpen(true);
    }

    function dayClick(ds: string) {
        if(mode === 'single'){
            setSelDates([ds]);
            openMarkModal([ds]);
            return;
        }

        if(!rangeStart){
            setRangeStart(ds);
            setSelDates([ds])
        }else {
            const start = rangeStart <= ds ? rangeStart : ds;
            const end = rangeStart <= ds ? ds : rangeStart;
            const days = rangeDays(start , end);
            
            setSelDates(days);
            setRangeStart(null);
        }
    }

    function applyMulti() {
        if (selDates.length > 0) openMarkModal(selDates);
    }

    function addExtraCountry(cc: CountryCode) {
        if (cc === currentCountry()) { 
            setCountryPickerOpen(false);
            return;
        }

        if (!CAL.extraCountries.includes(cc)) CAL.extraCountries = [...CAL.extraCountries , cc];

        notify();
        setCountryPickerOpen(false);
    }

    function removeExtraCountry(cc: CountryCode) {
        CAL.extraCountries = CAL.extraCountries.filter((x) => x !== cc);
        notify();
    }

    const monthGrid = useMemo(() => {
        const first = new Date(vy, vm, 1).getDay();
        const offset = first === 0 ? 6 : first -1;
        const dim = new Date(vy, vm + 1, 0).getDate();
        const holidays = holidayForYear(vy);
        const today = new Date();

        let rStart: string | null = null;
        let rEnd: string | null = null;

        if(mode === 'range'){
            if (selDates.length > 0) {
               const sorted = [...selDates].sort();
               rStart = sorted[0];
               rEnd = sorted[sorted.length - 1];
            }else if (rangeStart) {
                rStart = rangeStart;
            }
        }

        const cells: {ds: string | null; d: number}[] = [];

        for (let i = 0; i < offset; i++) {
            cells.push({ds: null , d: 0});
        }

        for (let d = 0; d <= dim; d++) {
            cells.push({ds: `${vy}-${pad(vm + 1)}-${pad(d)}`, d});
            
        }

        return cells.map(({ds , d}) =>{
            if (!ds) return { empty: true as const, key: `empty-${d}-${Math.random()}`};

            const entries = S.ev[ds] || [];
            const dow = new Date (vy, vm, d).getDay();
            const isWeekend = dow === 0 || dow === 6;
            const isHoliday = holidays.has(ds);
            const isToday = vy === today.getFullYear() && vm === today.getMonth() && d === today.getDate();
            const isSelectedMulti = mode !== 'range' && selDates.includes(ds);

            let rangePos: 'start' | 'end' | 'mid' | null = null;
            
            if (mode === 'range') {
                if (rStart && rEnd) {
                    if (ds === rStart) rangePos = 'start';
                    else if (ds === rEnd) rangePos = 'end';
                    else if (ds > rStart && ds < rEnd) rangePos = 'mid';
                } else if (rStart && ds === rStart) {
                    rangePos = 'start';
                }
            }
            
            const hName = isHoliday ? (holidayName(ds, lang) || t('t_holiday')) : null;
            const extras = extraHolidayFor(ds, lang);

            return {
                empty: false as const, ds, d, isWeekend, isHoliday, 
                isToday, isSelectedMulti, rangePos, entries, hName, extras,
                key: ds
            };
        })

    }, [vy, vm, mode, selDates, rangeStart, S.ev, CAL.inclWE, CAL.exclLeave, CAL.extraCountries, CAL.local])

    const rangeHintText = rangeStart ? t('rng_click_end') :
        selDates.length > 0 ? tn('rng_days_selected_hint', {n: selDates.length}) : t('rng_click_start');

    const availableExtraCountries = (Object.keys(COUNTRY_FLAG) as CountryCode[]).filter(
        (cc) => cc !== currentCountry() && !CAL.extraCountries.includes(cc)
    );

    return (
        <View style = {styles.screen}>
            <Header syncing />
            <ScrollView contentContainerStyle = {styles.scroll}>
                <View style = {styles.toolbar}>
                    <TouchableOpacity style = {styles.navBtn} onPress={() => shitfMonth(-1)}>
                        <Text style = {styles.navBtnText}>&#8249;</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = {styles.monthLabel} onPress={() => setCountryPickerOpen(true)}>
                        <Text style = {styles.monthLabelText}>{monthNames()[vm]} {vy}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = {styles.navBtn} onPress={() => shitfMonth(1)}>
                        <Text style = {styles.navBtnText}>&#8250;</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = {styles.todayBtn} onPress={goToday}>
                        <Text style = {styles.todayBtnText}>{t('today_btn')}</Text>
                    </TouchableOpacity>
                </View>

                <View style = {styles.legend}>
                    <View style = {styles.legendItem}>
                        <View style = {[styles.legendDot, {backgroundColor: typeColor('leave')}]}/>
                        <Text style = {styles.legendLabel}>{t('t_leave')}</Text>
                        <Text style = {styles.legendStat}>{tn('leg_leave_stat', {u: stats.leaveCons, l: stats.leaveACO})}</Text>
                    </View>

                    <View style = {styles.legendItem}>
                        <View style = {[styles.legendDot, { backgroundColor: typeColor('permit')}]}/>
                        <Text style = {styles.legendLabel}>{t('t_office')}</Text>
                        <Text style = {styles.legendStat}>{tn('leg_permit_stat', {u: stats.permitHours, l: stats.permitHourACO})}</Text>
                    </View>

                    <View style = {styles.legendItem}>
                        <View style = {[styles.legendDot, {backgroundColor: typeColor('office')}]} />
                        <Text style = {styles.legendLabel}>{t('t_office')}</Text>
                        <Text style = {styles.legendStat}>{tn('leg_office_stat', {u: stats.officeDays})}</Text>
                    </View>
                </View>

                <View style = {styles.selBar}>
                    <TouchableOpacity
                        style = {[styles.modeBtn, mode ==='single' && styles.modeBtnActive]}
                        onPress={() => setSelMode('single')}
                    >
                        <Text style = {[styles.modeBtnText, mode === 'single' && styles.modeBtnTextActive]}>{t('mode_single')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style = {[styles.modeBtn, mode === 'range' && styles.modeBtnActive]}
                        onPress={() => setSelMode('range')}
                    >
                       <Text style = {[styles.modeBtnText, mode === 'range' && styles.modeBtnTextActive]}>{t('mode_range')}</Text>
                    </TouchableOpacity>
                </View>

                {mode === 'range' && (
                    <View style = {styles.rangeRow}>
                        <Text style = {styles.rangeHint}>{rangeHintText}</Text>
                        {selDates.length >  0 && (
                            <>
                                <TouchableOpacity style = {styles.btnCancelMulti} onPress={clearMultiSelection}>
                                    <Text style = {styles.btnCancelMultiText}>{t('m_cancel')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style = {styles.btnApplyMulti} onPress={applyMulti}>
                                    <Text style = {styles.btnApplyMultiText}>{tn('rng_mark_btn', {n: selDates.length})}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}

                <View style = {styles.optsRow}>
                    <TouchableOpacity style = {[styles.optToggle, CAL.inclWE && styles.optToggleOn]} onPress={() => toogleOption('we')}>
                        <Text style = {[styles.optToggleText, CAL.inclWE && styles.optToggleTextOn]}>{t('incl_weekend')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = {[styles.optToggle, CAL.exclLeave && styles.optToggleOn]} onPress={() => toogleOption('leave')}>
                        <Text style = {[styles.optToggleText, CAL.exclLeave && styles.optToggleTextOn]}>{t('excl_holidays')}</Text>
                    </TouchableOpacity>
                </View>
                
                <View style = {styles.extraRow}>
                    <TouchableOpacity style = {styles.extraAddBtn} onPress={() => setCountryPickerOpen(true)}>
                        <Text style = {styles.extraAddBtnText}>{t('cal_add_country')}</Text>
                    </TouchableOpacity>
                    <View style = {styles.extraChips}>
                        {CAL.extraCountries.map((cc) => (
                            <TouchableOpacity key = {cc} style = {styles.extraChip} onPress={() => removeExtraCountry(cc)}>
                                <Text style = {styles.extraChipText}>
                                    {COUNTRY_FLAG[cc]}  {countryName(cc, lang)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style = {styles.wdaysRow}>
                    {monthNamesWeekdays(lang).map((wd, i) => {
                        return <Text key={i} style = {styles.wday}>{wd}</Text>;
                    })}
                </View>

                <View style = {styles.daysGrid}>
                    {monthGrid.map((cell) => {
                        if (cell.empty) return <View key={cell.key} style={styles.dayCell}/>;

                        const {
                            ds, d, isWeekend, isHoliday, isToday, isSelectedMulti, rangePos, entries, hName, extras
                        } = cell;

                        const cellStyle = [
                            styles.dayCell,
                            isWeekend && styles.dayWeekend,
                            isHoliday && styles.dayHoliday,
                            isToday && styles.dayToday,
                            isSelectedMulti && styles.daySelected,
                            rangePos === 'start' && styles.rangeStart,
                            rangePos === 'end' && styles.rangeEnd,
                            rangePos === 'mid' && styles.rangeMid
                        ]

                        return (
                            <TouchableOpacity key={cell.key} style = {cellStyle} onPress={() => dayClick(ds!)}>
                                <Text style = {styles.dayNum}>{d}</Text>
                                {entries.map((ev, i) => {
                                    let qNote = '';
                                    if (ev.type !== 'office') {
                                        if(ev.qty === 'half') qNote = `${t(ev.half === 'morning' ? 'm_morning_short' : 'm_afternoon_short')}`;
                                        else if (ev.qty === 'hours') qNote = `${ev.hours}h`;
                                    }
                                    
                                    return (
                                        <View key={i} style = {[styles.tag, { backgroundColor: typeColor(ev.type) }]}>
                                            <Text style = {styles.tagText} numberOfLines={1}>
                                                {t('calendar_add_' + ev.type)}{qNote}
                                            </Text>
                                        </View>
                                    )
                                })}

                                {isHoliday && (
                                    <View style = {[styles.tag, styles.tagHoliday]}>
                                        <Text style = {styles.tagTextHoliday} numberOfLines={1}>&#127881; {hName}</Text>
                                    </View>
                                )}

                                {extras.map((ex, i) => (
                                    <View key={i} style = {[styles.tag, styles.tagExtra]}>
                                        <Text style = {styles.tagTextExtra} numberOfLines={1}>{COUNTRY_FLAG[ex.country]} {ex.name}</Text>
                                    </View>
                                ))}
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>

            <EventModal 
                visible = {modalOpen}
                dates= {modalDates}
                onClose= {() => setModalOpen(false)}
                onSaved= {() => {setModalOpen(false); clearMultiSelection(); }}
            />

            <Modal visible = {monthPickerOpen} transparent animationType="fade" onRequestClose={() => setMonthPickerOpen(false)}>
                <TouchableOpacity style = {styles.pickerOverlay} activeOpacity={1} onPress={() => setMonthPickerOpen(false)}>
                    <View style = {styles.pickerCard}>
                        <View style = {styles.yearStepper}>
                            <TouchableOpacity onPress={() => setVy(vy - 1)}>
                                <Text style = {styles.yearStepBtn}>&#8722;</Text>
                            </TouchableOpacity>

                            <Text style = {styles.yearStepValue}>{vy}</Text>

                            <TouchableOpacity onPress={() => setVy(vy + 1)}>
                                <Text style = {styles.yearStepBtn}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style = {styles.monthPickerGrid}>
                            {monthNames().map((nameMonth, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style = {[styles.monthPickBtn, vm === i && styles.monthPickBtnActive]}
                                    onPress={() => {setVm(i); setMonthPickerOpen(false); clearMultiSelection(); }}
                                >
                                    <Text style = {[styles.monthPickBtnText, vm === i && styles.monthPickBtnTextActive]}>{nameMonth.slice(0, 3)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible = {countryPickeOpen} transparent animationType="fade" onRequestClose={() => setCountryPickerOpen(false)}>
                <TouchableOpacity style = {styles.pickerOverlay} activeOpacity={1} onPress={() => setCountryPickerOpen(false)}>
                    <View style = {styles.pickerCard}>
                        <FlatList
                            data={availableExtraCountries}
                            keyExtractor={(cc) => cc}
                            renderItem={({ item: cc }) => (
                                <TouchableOpacity style = {styles.countryRow} onPress={() => addExtraCountry(cc)}>
                                    <Text style = {styles.countryRowText}>{COUNTRY_FLAG[cc]} {countryName(cc, lang)}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
} 

function monthNamesWeekdays(lang: string): string[] {
    const map: Record<string, string[]> = {
        it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
        en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        nl: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
        pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    };

    return map[lang] || map.it;
}

const CELL_WIDTH = '14.28%';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 12, paddingBottom: 40 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  navBtn: {
    width: 34, height: 34, borderRadius: 8, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  navBtnText: { fontSize: 18, color: colors.text },
  monthLabel: { flex: 1, alignItems: 'center' },
  monthLabelText: { fontSize: 16, fontWeight: '700', color: colors.text },
  todayBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  todayBtnText: { fontSize: 12, fontWeight: '600', color: colors.text },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, fontWeight: '600', color: colors.text },
  legendStat: { fontSize: 11, color: colors.muted },
  selBar: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  modeBtn: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  modeBtnActive: { backgroundColor: colors.text, borderColor: colors.text },
  modeBtnText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  modeBtnTextActive: { color: colors.bg },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  rangeHint: { fontSize: 12, color: colors.muted, flex: 1 },
  btnCancelMulti: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 10 },
  btnCancelMultiText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  btnApplyMulti: { backgroundColor: colors.text, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  btnApplyMultiText: { fontSize: 12, color: colors.bg, fontWeight: '700' },
  optsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  optToggle: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 10 },
  optToggleOn: { backgroundColor: colors.leaveLight, borderColor: colors.leave },
  optToggleText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  optToggleTextOn: { color: colors.leave },
  extraRow: { marginBottom: 10 },
  extraAddBtn: { alignSelf: 'flex-start', marginBottom: 6 },
  extraAddBtnText: { fontSize: 11, color: colors.leave, fontWeight: '600' },
  extraChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  extraChip: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingVertical: 4, paddingHorizontal: 10 },
  extraChipText: { fontSize: 11, color: colors.text },
  wdaysRow: { flexDirection: 'row', marginBottom: 4 },
  wday: { width: CELL_WIDTH, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.muted },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: CELL_WIDTH, minHeight: 64, padding: 3, borderWidth: 0.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayWeekend: { backgroundColor: colors.surface2 },
  dayHoliday: { backgroundColor: '#fff7ed' },
  dayToday: { borderColor: colors.leave, borderWidth: 1.5 },
  daySelected: { backgroundColor: colors.leaveLight },
  rangeStart: { backgroundColor: colors.leave },
  rangeEnd: { backgroundColor: colors.leave },
  rangeMid: { backgroundColor: colors.leaveLight },
  dayNum: { fontSize: 11, fontWeight: '600', color: colors.text },
  tag: { borderRadius: 3, paddingHorizontal: 3, paddingVertical: 1, marginTop: 2 },
  tagText: { fontSize: 8, color: '#fff', fontWeight: '700' },
  tagHoliday: { backgroundColor: '#fed7aa' },
  tagTextHoliday: { fontSize: 8, color: '#9a3412', fontWeight: '700' },
  tagExtra: { backgroundColor: '#e0e7ff' },
  tagTextExtra: { fontSize: 8, color: '#3730a3', fontWeight: '700' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(28,25,23,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  pickerCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, width: '100%', maxWidth: 380, maxHeight: '70%' },
  yearStepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 14 },
  yearStepBtn: { fontSize: 22, color: colors.text, paddingHorizontal: 10 },
  yearStepValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  monthPickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  monthPickBtn: { width: '28%', paddingVertical: 10, borderRadius: 8, backgroundColor: colors.surface2, alignItems: 'center' },
  monthPickBtnActive: { backgroundColor: colors.leave },
  monthPickBtnText: { fontSize: 12, color: colors.text, fontWeight: '600' },
  monthPickBtnTextActive: { color: '#fff' },
  countryRow: { paddingVertical: 12, paddingHorizontal: 8 },
  countryRowText: { fontSize: 14, color: colors.text },
});