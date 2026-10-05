import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase";
import { session, resetLocalState, notify, useAppVersion } from "../state/appState";
import { initLocal } from "../lib/locales";
import { loadConfig, loadAmountCarriedOver, startEventsListener, stopEventListener } from "../state/data";
import { t } from "../lib/i18n";
import { colors } from "../theme/colors";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ReportScreen from "../screens/ReportScreen";
import SettingsScreen from "../screens/SettingScreen";

const Tab = createBottomTabNavigator();

function MainTabs() {
    useAppVersion();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.leave,
                tabBarInactiveTintColor: colors.muted,
                tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
                tabBarIcon: ({ color, size }) => {
                    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
                        Dashboard: 'grid-outline',
                        Calendar: 'calendar-outline',
                        Report: 'document-text-outline',
                        Setting: 'settings-outline'
                    };
                    return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
                }
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: t('nav_dashboard') }} />
            <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: t('nav_calendar') }} />
            <Tab.Screen name="Report" component={ReportScreen} options={{ tabBarLabel: t('nav_report') }} />
            <Tab.Screen name="Setting" component={SettingsScreen} options={{ tabBarLabel: t('nav_settings') }} />
        </Tab.Navigator>
    )
}

export default function RootNavigator() {
    const [booting, setBooting] = useState(true);
    const [signedIn, setSignedIn] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            await initLocal();

            const unsub = onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    stopEventListener();
                    resetLocalState();

                    if (mounted) {
                        setSignedIn(false);
                        setBooting(false);
                    }

                    return;
                }

                session.uid = user.uid;
                session.email = user.email;

                await loadConfig();
                await loadAmountCarriedOver();
                notify();

                startEventsListener(() => notify());

                if (mounted) {
                    setSignedIn(true);
                    setBooting(false);
                }
            });

            return unsub;
        })();

        return () => {
            mounted = false;
        };
    }, []);

    if (booting) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.leave} />
            </View>
        )
    }

    return (
        <NavigationContainer>
            {signedIn ? <MainTabs /> : <LoginScreen />}
        </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});