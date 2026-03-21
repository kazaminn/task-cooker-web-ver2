import { initializeApp, getApps, getApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

declare global {
  interface Window {
    _firebase_emulators_connected?: boolean;
  }

  interface globalThis {
    _firebase_emulators_connected?: boolean;
  }
}

const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';
const firebaseGlobal = globalThis as typeof globalThis & {
  _firebase_emulators_connected?: boolean;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// Use existing app instance if it exists to support Vite's HMR
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (useEmulator && !firebaseGlobal._firebase_emulators_connected) {
  const authHost =
    (import.meta.env.VITE_AUTH_EMULATOR_HOST as string) ||
    'http://localhost:9099';
  const firestoreHost =
    (import.meta.env.VITE_FIRESTORE_EMULATOR_HOST as string) ||
    'localhost:8080';
  const [fsHost, fsPort] = firestoreHost.split(':');

  connectAuthEmulator(auth, authHost, { disableWarnings: true });
  connectFirestoreEmulator(db, fsHost, Number(fsPort));
  firebaseGlobal._firebase_emulators_connected = true;
  console.warn(
    `[firebase] connected to emulators (auth: ${authHost}, firestore: ${firestoreHost})`
  );
}
