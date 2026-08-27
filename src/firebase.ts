import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, User} from 'firebase/auth';
import { getFirestore, doc, collection, CollectionReference, DocumentReference } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { session } from "./state/appState";
import { t } from "./lib/i18n";

//@ts-ignore
import { getReactNativePersistence } from 'firebase/auth';

export const firebaseConfig = {
    apiKey: 'AIzaSyDaMfI_WpuzAl47lD7oiq27R_MhkfkcTmg',
    authDomain: 'ferie-roberto-delfino.firebaseapp.com',
    projectId: 'ferie-roberto-delfino',
    storageBucket: 'ferie-roberto-delfino.firebasestorage.app',
    messagingSenderId: '35801687279',
    appId: '1:35801687279:web:31eb60dc4def11976fe71a',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let _auth : ReturnType<typeof getAuth>;

try {
    _auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch {
    _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);

export const evRef = () : CollectionReference => collection(db, 'users', session.uid as string, 'events');

export const cfgRef = () : DocumentReference => doc(db, 'users', session.uid as string, 'cconfig', 'main');

export const amountCORef = () : CollectionReference => collection(db, 'users', session.uid as string, 'amountCarriedOver');

export function tradErr(code: string) : string {
    const m: Record<string, string> = {
        'auth/user-not-found' : t('err_user_not_found'),
        'auth/wrong-password' : t('err_wrong_password'),
        'auth/invalid-email' : t('err_invalid_email'),
        'auth/email-already-in-use' : t('err_email_in_use'),
        'auth/invalid-credential' : t('err_invalid_credential')
    };

    return m[code] || t('set_error_prefix') + code;
}

export type { User };