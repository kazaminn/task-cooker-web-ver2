import { initializeApp, getApps, getApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

declare global {
  interface Window {
    _firebase_emulators_connected?: boolean;
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Use existing app instance if it exists to support Vite's HMR
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (import.meta.env.DEV) {
  // Guard against multiple calls to support Vite's HMR.
  if (!window._firebase_emulators_connected) {
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, 'localhost', 8080);
    window._firebase_emulators_connected = true;
    console.log('connected to firebase emulators');
  }
}
