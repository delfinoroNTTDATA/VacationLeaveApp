import React from "react";
import { NavigationContainer } from '@react-navigation/native'
import AppNavigator from './src/navigation/AppNavigator';
import { LangProvider } from './src/i18n/translations';

export default function App() {

  return (
    <LangProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </LangProvider>
  );
}

