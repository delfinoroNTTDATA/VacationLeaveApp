# Ferie & Permessi — Mobile App (Android + iOS)

A React Native app (Expo, TypeScript) that brings the same features of the
"Ferie & Permessi" web app to Android and iOS: login, dashboard, calendar,
reports with Excel export, and settings. It uses **the same Firebase
project** as the web app (Firestore + Auth), so data stays in sync across
the website, Android, and iOS under the same account.

## Project structure

```
src/
├── firebase.ts              Firebase config (same project as the web app)
├── lib/
│   ├── calc.ts               Vacation/leave/carry-over calculations
│   ├── holidays.ts           Holidays for 10 countries (Easter formula)
│   ├── holidayNames.ts       Holiday names in 7 languages
│   ├── locales.ts            13 locales (UI language + holiday country)
│   └── i18n.ts                Translations IT/EN/DE/FR/ES/NL/PT
├── state/
│   ├── appState.ts           Shared state (equivalent of S/CAL)
│   └── data.ts                Firestore load/save + event listener
├── theme/colors.ts            Palette and design tokens
├── components/
│   ├── Header.tsx             Header with language selector
│   └── EventModal.tsx         "Mark day" modal
├── screens/
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── CalendarScreen.tsx
│   ├── ReportScreen.tsx       Includes Excel export (xlsx + sharing)
│   └── SettingsScreen.tsx
└── navigation/RootNavigator.tsx  Tab bar + auth guard
```

## Requirements

- Node.js 18+ and npm
- The **Expo Go** app on your phone (Android/iOS), to test without a native build
- For installable builds (without Expo Go): a free Expo account and `eas-cli`

## Quick start (testing on a phone with Expo Go)

```bash
cd FerieEPermessi
npm install
npx expo start
```

A QR code opens in the terminal:
- **Android**: open the Expo Go app, scan the QR code
- **iOS**: open the Camera app, point it at the QR code, it will open in Expo Go

The app will immediately use the same account/data as the web app: log in
with the same email/password credentials already used on the website.

## Installable build (Android APK / iOS IPA) without Expo Go

This environment cannot directly generate an `.apk`/`.ipa` file (it
requires the native Android/Xcode toolchain or Expo's cloud service,
EAS). To do it from your own PC:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview   # generates an installable APK
eas build --platform ios --profile preview        # requires an Apple Developer account
```

The bundle id/package is already set to `com.ferie.app` (the same as the
existing Kotlin Android app), so the Play Store/App Store treat them as
consistent apps within the same project.

## Technical notes

- **Firebase**: the credentials in `src/firebase.ts` are the same as the
  web app (same project `ferie-roberto-delfino`). These are public client
  keys: security is handled by Firestore rules, not by keeping them
  secret.
- **Session persistence**: authentication uses
  `getReactNativePersistence` with AsyncStorage, so the login stays
  active between app restarts.
- **Excel export**: uses the same `xlsx` library (SheetJS) as the web
  app; on mobile the file is written locally and then shared via the
  native share sheet (instead of the browser's direct download).
- **Languages**: all 7 languages and 13 locales from the web app have
  been ported 1:1 (same translation keys).
- **App icon**: reuses the official icon already designed for the web
  app (calendar + sun, sunset palette), adapted for iOS (full-bleed) and
  Android (adaptive icon with foreground/background/monochrome layers).

## What is NOT (yet) included

- Push notifications
- Advanced offline mode (the app still reads/writes from the Firestore
  cache when offline, but there's no dedicated sync queue)
- Automated tests

These are great next steps if you want to keep developing it.