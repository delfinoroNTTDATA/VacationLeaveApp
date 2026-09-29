import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
} from 'firebase/auth'
import { setDoc } from "firebase/firestore";
import { auth, cfgRef, tradErr } from "../firebase";
import { S, session, useAppVersion } from "../state/appState";
import { t } from "../lib/i18n";
import { colors, radius } from "../theme/colors";

export default function LoginScreen() {
    useAppVersion();
    
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function doLogin() {
        setError('');
        setBusy(true);

        try {
            await signInWithEmailAndPassword(auth, email.trim(), pass);
        } catch (e: any) {
           setError(tradErr(e.code)); 
        } finally {
            setBusy(false)
        }
    }

    async function doRegister() {
        setError('');
        

        if (pass.length < 6) {
            setError(t('login_err_pass_length'));
            return;
        }

        setBusy(true);

        try {
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
            session.uid = cred.user.uid;
            await setDoc(cfgRef(), { ...S.cfg });
        } catch (e: any) {
            setError(tradErr(e.code));
        } finally {
            setBusy(false);
        }
    }

    return (
        <SafeAreaView style = {styles.safe}>
            <KeyboardAvoidingView
                style = {styles.flex}
                behavior = {Platform.OS === 'ios' ? 'padding' : undefined} 
            >
               <ScrollView contentContainerStyle = {styles.scroll} keyboardShouldPersistTaps = "handled">
                    <View style = {styles.box}>
                        <Text style = {styles.logo}> Ferie
                            <Text style = {styles.logoAmp}>&amp;</Text>
                        Permessi </Text>
                        <Text style = {styles.sub}>{t('login_sub')}</Text>

                        <Text style = {styles.label}>{t('login_email')}</Text>
                        <TextInput
                            style = {styles.input}
                            value = {email}
                            onChangeText = {setEmail}
                            placeholder = "nome@email.com"
                            placeholderTextColor = {colors.muted}
                            autoCapitalize = "none"
                            autoComplete = "email"
                            keyboardType = "email-address"
                        />

                        <Text style = {styles.label}>{t('login_pass')}</Text>
                        <TextInput
                            style = {styles.input}
                            value = {pass}
                            onChangeText = {setPass}
                            placeholder = "••••••••"
                            placeholderTextColor = {colors.muted}
                            secureTextEntry
                            autoComplete = "password"
                            onSubmitEditing={doLogin}
                        />

                        {error ? <Text style = {styles.error}>{error}</Text> : <View style = {styles.errorSpace}/>}

                        <TouchableOpacity style = {styles.btnPrimary} onPress={doLogin} disabled = {busy}>
                            <Text style = {styles.btnPrimaryText}>{t('login_signin')}</Text>
                        </TouchableOpacity>

                        <Text style = {styles.divider}>{t('login_or')}</Text>

                        <TouchableOpacity style = {styles.btnSecondary} onPress={doRegister} disabled = {busy}>
                            <Text style = {styles.btnSecondaryText}>{t('login_register')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView> 
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  logo: { fontFamily: 'serif', fontSize: 24, textAlign: 'center', marginBottom: 6, color: colors.text },
  logoAmp: { color: colors.accentGold },
  sub: { textAlign: 'center', color: colors.muted, fontSize: 13, marginBottom: 24 },
  label: {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6,
    color: colors.muted, marginBottom: 5,
  },
  input: {
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    color: colors.text, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 9,
    fontSize: 15, marginBottom: 14,
  },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center', minHeight: 18, marginBottom: 8 },
  errorSpace: { minHeight: 18, marginBottom: 8 },
  btnPrimary: { backgroundColor: colors.text, borderRadius: 9, padding: 13, marginBottom: 10 },
  btnPrimaryText: { color: colors.bg, textAlign: 'center', fontWeight: '700', fontSize: 15 },
  divider: { textAlign: 'center', color: colors.muted, fontSize: 12, marginVertical: 4 },
  btnSecondary: {
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    borderRadius: 9, padding: 13, marginTop: 6,
  },
  btnSecondaryText: { color: colors.muted, textAlign: 'center', fontWeight: '700', fontSize: 15 },
});