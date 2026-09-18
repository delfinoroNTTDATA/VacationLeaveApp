 import React, {useState} from "react";
 import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Platform } from "react-native";
 import { SafeAreaView } from "react-native-safe-area-context";
 import { signOut } from "firebase/auth";
 import { auth } from "../firebase";
 import { colors } from "../theme/colors";
 import { CAL, session, useAppVersion, notify } from "../state/appState";
 import { LOCALES, setLocal } from "../lib/locales";
 import { t } from "../lib/i18n";

 interface HeaderProps {
    syncing?: boolean;
 }

 export default function Header({ syncing }: HeaderProps) {
    useAppVersion();
    const [pickerOpen, setPickerOpen] = useState(false);
    const currentLocale = LOCALES[CAL.local];

    async function handleSelectLocale(code: string) {
        await setLocal(code);
        CAL.local = code;
        notify();
        setPickerOpen(false);
    }
    
    async function handleLogout() {
        await signOut(auth);
    }

    const email = session.email || "";
    const initial = email ? email[0].toUpperCase() : "U";

    return (
        <SafeAreaView edges={['top']} style={styles.safe}>
            <View style={styles.bar}>
                <Text style={styles.logo}>
                    Ferie <Text style={styles.logoAmp}>&amp;</Text> Permessi
                </Text>

                <View style={styles.right}>
                    {syncing ? <Text style={styles.syncBadge}>Sync</Text> : null}

                    <TouchableOpacity style={styles.langBtn} onPress={() => setPickerOpen(true)}>
                        <Text style={styles.langBtnText}>
                            {currentLocale.flag} {CAL.local.split("-")[0].toUpperCase()}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.userChip}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initial}</Text>
                        </View>
                        <TouchableOpacity onPress={handleLogout}>
                            <Text style={styles.logoutText}>{t("logout")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
                <TouchableOpacity style = {styles.modalOverlay} activeOpacity={1} onPress={() => setPickerOpen(false)}>  
                    <View style = {styles.modalCard}>
                        <FlatList
                            data={Object.entries(LOCALES)}
                            keyExtractor={([code]) => code}
                            renderItem={({ item: [code, l] }) => (
                                <TouchableOpacity
                                    style={[styles.localeRow, code === CAL.local && styles.localeRowActive]}
                                    onPress={() => handleSelectLocale(code)}
                                >
                                    <Text style={styles.localeText}>
                                        {l.flag} {l.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
 }

 const styles = StyleSheet.create({
  safe: { backgroundColor: colors.headerBg },
  bar: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    color: colors.headerText,
    fontSize: 17,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  logoAmp: { color: colors.accentGold },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  syncBadge: { fontSize: 11, color: colors.sync },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  langBtnText: { color: 'rgba(244,241,235,0.9)', fontSize: 12, fontWeight: '600' },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 11, fontWeight: '700', color: colors.text },
  logoutText: { color: 'rgba(244,241,235,0.7)', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(28,25,23,0.55)', justifyContent: 'center', padding: 30 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 16, maxHeight: '70%', paddingVertical: 8 },
  localeRow: { paddingVertical: 12, paddingHorizontal: 18 },
  localeRowActive: { backgroundColor: colors.surface2 },
  localeText: { fontSize: 15, color: colors.text },
});