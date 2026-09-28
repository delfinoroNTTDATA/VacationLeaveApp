import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { S, useAppVersion } from "../state/appState";
import { calcStats } from "../lib/calc";
import { t, tn, monthNames } from "../lib/i18n";
import { colors, radius, typeColor } from "../theme/colors";
import Header from "../components/Header";

function StatCard({
    label, value, sub, aco, pct, accent
} : {
    label: string; value: string; sub: string; aco?: string; pct?: number; accent: string;
}) {
   return (
      <View style = {[styles.card, { borderTopColor: accent }]}>
        <Text style = { styles.cardLabel }>{label}</Text>
        <Text style = { styles.cardValue }>{value}</Text>
        <Text style = { styles.cardSub }>{sub}</Text>
        {aco ? <Text style = {styles.cardAco}>&#8635; {aco}</Text> : null}
        {pct !== undefined && pct > 0 ? (
          <View style = { styles.barTrack }>
            <View style = {[styles.barFill, { width: `${Math.min(100,pct)}%`, backgroundColor: accent}]}/>
          </View>
        ) : null}
      </View>
    ) 
}

export default function  DashboardScreen() {
  useAppVersion();
  const yr = S.cfg.year;
  const st = calcStats(yr);
  const aco = st.amountCarriedOver;
  
  const showBanner = aco.leaveDays > 0 || aco.permitHours > 0;
  const fromLabel = S.cfg.aCOEnabled ? tn('aco_from_year', { yr: yr - 1 }) : t('aco_manual');
  const deadlineLabel = st.noteDeadlineMonth ? 
                          `${monthNames()[st.noteDeadlineMonth - 1]} ${st.noteDeadlineYear}` : null;

  const recent = Object.entries(S.ev).sort(([a], [b]) => b.localeCompare(a)).slice(0, 8);

  return (
    <View style = {styles.screen}>
      <Header syncing />
      <ScrollView contentContainerStyle = {styles.scroll}>
        {showBanner ? (
          <View style = {styles.acoBanner}>
            <Text style = {styles.acoIcon}>&#8635;</Text>
            <View style = {{ flex: 1}}>
              <Text style = {styles.acoTitle}>{t('aco_banner_title')} = {fromLabel}</Text>
              <Text style = {styles.acoDetail}>
                {aco.leaveDays > 0 ? `+${aco.leaveDays}gg ${t('t_leave')} (${aco.leaveDays * S.cfg.dayHours}h)` : ''}
                {aco.leaveDays > 0 && aco.permitHours > 0 ? ' e ' : ''}
                {aco.permitHours > 0 ? `+${aco.permitHours}h ${t('t_permit')}` : ''}
                {deadlineLabel ? ` — Scade entro ${deadlineLabel}` : ''}
              </Text>
            </View>
          </View>
        ) : null}

        <View style = {styles.grid}>
          <StatCard 
            label= {t('leave_left')}
            value= {`${st.leaveACO}`}
            sub= {tn('days_count_suffix', {n: st.leaveCons})}
            pct={(st.leaveCons / st.leaveTotalYearly) * 100}
            accent={typeColor('leave')}
          />

          <StatCard
            label= {t('leave_hours_used')}
            value= {`${st.leaveHours}h`}
            sub= {tn('days_count_suffix', {n: st.leaveCons})}
            pct={(st.leaveCons / st.leaveTotalYearly) * 100}
            accent={typeColor('leave')}
          />

          <StatCard
            label= {t('permit_hours_left')}
            value= {`${st.permitHourACO}`}
            sub= {`${st.permitHours}h / ${st.leaveTotalYearly}h`}
            pct= {(st.permitHours / st.permitTotalYearly) * 100}
            accent= {typeColor('permit')}
          />

          <StatCard
            label= {t('permit_days')}
            value= {`${st.permitDay}gg`}
            sub= {`=${st.permitHours}h`}
            pct= {(st.permitHours / st.permitTotalYearly) * 100}
            accent= {typeColor('permit')}
          />

          <StatCard
            label= {t('office_days')}
            value= {String(st.officeDays)}
            sub= {String(yr)}
            accent= {typeColor('office')}
          />
        </View>

        <Text style = {styles.sectionTitle}>{t('recent_events')}</Text>

        {recent.length === 0 ? (
          <View style = {styles.emptyMsg}>
            <Text style = {styles.emptyText}>{t('no_events_dashboard')}</Text>
          </View>
        ) : (
          <View style = {styles.recentList}>
            {recent.flatMap(([d, entries]) => {
              const [y, m, dd] = d.split('-');
              return entries.map((ev, i) => {
                const icon = ev.type === 'leave' ? '🌴' : ev.type === 'permit' ? '⏰' : '🏢';
                const label = ev.type === 'leave' ? t('t_leave') : ev.type === 'permit' ? t('t_permit') : t('t_office');
                let qNote = '';

                if (ev.type !== 'office') {
                  if (ev.qty === 'half') qNote = t(ev.half === 'morning' ? 'm_morning' : 'm_afternoon');
                  else if (ev.qty === 'hours') qNote = ` - ${ev.hours}h`;
                }

                return (
                  <View key= {`${d}-${i}`} style = {styles.recentRow}>
                    <Text style = {styles.recentIcon}>{icon}</Text>
                    <View style = {{flex: 1}}>
                      <Text style = {styles.recentDate}> {dd}/{m}/{y}
                        <Text style = {styles.recentNote}>{qNote}</Text>
                      </Text>
                    </View>
                    <View style = {[styles.badge, {backgroundColor: typeColor(ev.type)}]}>
                      <Text style = {styles.badgeText}>{label}</Text>
                    </View>
                  </View>
                )
              })
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  acoBanner: {
    flexDirection: 'row', gap: 12, backgroundColor: colors.acoLight,
    borderRadius: radius.md, padding: 14, marginBottom: 16, alignItems: 'flex-start',
  },
  acoIcon: { fontSize: 20, color: colors.aco },
  acoTitle: { fontWeight: '700', color: colors.aco, fontSize: 13, marginBottom: 2 },
  acoDetail: { fontSize: 12, color: colors.textSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14,
    width: '47%', borderTopWidth: 3,
  },
  cardLabel: { fontSize: 11, color: colors.muted, fontWeight: '600', marginBottom: 6 },
  cardValue: { fontSize: 22, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  cardAco: { fontSize: 11, color: colors.aco, marginTop: 4, fontWeight: '600' },
  barTrack: { height: 5, backgroundColor: colors.surface2, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  emptyMsg: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 20, alignItems: 'center' },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  recentList: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  recentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10,
    paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  recentIcon: { fontSize: 18 },
  recentDate: { fontWeight: '500', color: colors.text, fontSize: 13 },
  recentNote: { fontSize: 11, color: colors.muted },
  badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});