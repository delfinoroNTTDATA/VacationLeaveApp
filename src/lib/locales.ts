import AsyncStorage from '@react-native-async-storage/async-storage';

export type LangCode = 'it' | 'en' | 'de' | 'fr' | 'es' | 'nl' | 'pt'
export type CountryCode = 'IT' | 'DE' | 'FR' | 'ES' | 'UK' | 'US' | 'CH' | 'NL' | 'BE' | 'PT';

export interface LocalInfo {
    flag: string;
    label: string;
    lang: LangCode;
    country: CountryCode
}

export const LOCALES: Record<string , LocalInfo> = {
    'it-IT': { flag: '🇮🇹', label: 'Italiano', lang: 'it', country: 'IT'},
    'en-GB': { flag: '🇬🇧', label: 'English - UK', lang: 'en', country: 'UK' },
    'en-US': { flag: '🇺🇸', label: 'English - US', lang: 'en', country: 'US'},
    'de-DE': { flag: '🇩🇪', label: 'Deutsch (Deutschland)', lang: 'de', country: 'DE'},
    'fr-FR': { flag: '🇫🇷', label: 'Français (France)', lang: 'fr', country: 'FR'},
    'es-ES': { flag: '🇪🇸', label: 'Español (España)', lang: 'es', country: 'ES'},
    'nl-NL': { flag: '🇳🇱', label: 'Nederlands', lang: 'nl', country: 'NL'},
    'pt-PT': { flag: '🇵🇹', label: 'Português', lang: 'pt', country: 'PT'},
    'de-CH': { flag: '🇨🇭', label: 'Deutsch (Scweiz)', lang: 'de', country: 'CH'},
    'fr-CH': { flag: '🇨🇭', label: 'Français (Suisse)', lang: 'fr', country: 'CH'},
    'it-CH': { flag: '🇨🇭', label: 'Italiano (Svizzera)', lang: 'it', country: 'CH'},
    'fr-BE': { flag: '🇧🇪', label: 'Français (Belgique)', lang: 'fr', country: 'BE'},
    'nl-BE': { flag: '🇧🇪', label: 'Nederlands (België)', lang: 'nl', country: 'BE'}
};

export const DEFAULT_LOCAL = 'it-IT';
const STORAGE_KEY = 'leave_local';

let cachedLocal: string = DEFAULT_LOCAL;

export function getLocalSync() : string {
    return LOCALES[cachedLocal] ? cachedLocal : DEFAULT_LOCAL;
}

export async function initLocal() : Promise<string> {
    try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if( saved && LOCALES[saved]) cachedLocal = saved;
    }catch {

    }
    return getLocalSync();
}

export async function setLocal(code: string) {
    if (!LOCALES[code]) return;

    cachedLocal = code;
    try{
        await AsyncStorage.setItem(STORAGE_KEY, code);
    }catch {
        
    }
}