This project is a app for ios and Andoid with firebese.

# 📱 App React Native — Ferie & Permessi (iOS + Android) whit Firebase

## Project structure  

```
FerieApp/
├── package.json
├── app.json
├── App.tsx                          ← entry point
├── src/
│   ├── firebase/
│   │   └── config.ts                ←  Firebase configuration
│   ├── utils/
│   │   └── holidays.ts              ← Holidays of country
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   └── ReportScreen.tsx
│   ├── components/
│   │   ├── WelcomeWizard.tsx
│   │   ├── DayModal.tsx
│   │   └── StatCard.tsx
│   └── navigation/
│       └── AppNavigator.tsx
└── ios/   android/                  ←  auto-generated
```

---

## Initial setup

### 1. Install Node JS and React Native CLI

```bash
    # install Node.js from nodejs.org, after:
    npm install -g react-native-cli
    npm install -g @react-native-community/cli
    
```

### 2. Download the project

### 3. Install dependecy

```bash
    cd <your path and the name of the Project>

    # Navigations
    npm install @react-navigation/native @react-navigation/bottom-tabs
    npm install @react-navigation/native-stack
    npm install react-native-screens react-native-safe-area-context

    # Firebase
    npm install @react-native-firebase/app
    npm install @react-native-firebase/auth
    npm install @react-native-firebase/firestore

    # Calendar
    npm install react-native-calendars

    # Local storage
    npm install @react-native-async-storage/async-storage

    # UI components
    npm install react-native-modal

    # iOS — install pod
    cd ios && pod install && cd ..

```
### 4. Firebese configuration
    * Go to console.firebase.google.com → your project 
    * Add iOS app: download GoogleService-Info.plist → put it in ios/FerieApp/
    * Add Android app: download google-services.json → put it in android/app/

   


