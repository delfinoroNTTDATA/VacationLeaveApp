import  firestore  from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const getUID = () => auth().currentUser?.uid;

export const eventiRef = () => firestore().collection(`users/${getUID()}/evemts`);

export const configRef = () => firestore().doc(`users/${getUID()}/config/main`);

export const riportiRef = () => firestore().collection(`users/${getUID()}/riporti`);

export interface EventoGiorno {
    data: string;
    tipo: 'ferie' | 'permesso' | 'sede';
    qty: 'intero' | 'mezza' | 'ore';
    half: 'mattina' | 'pomeriggio';
    ore: number;
};

export interface ConfigUtente {
    ferieTotal: number;
    permOre: number;
    oreGiorno: number;
    anno: number;
    riportoAbilitato: boolean;
};

export interface RiportoAnno {
    anno: string;
    ferieOre: number;
    permOre: number;
};

export const DEFAULT_CONFIG: ConfigUtente = {
    ferieTotal: 28,
    permOre: 104,
    oreGiorno: 8,
    anno: new Date().getFullYear(),
    riportoAbilitato: false
};