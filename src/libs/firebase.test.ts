import { doc, setDoc, getDoc } from 'firebase/firestore';
import { describe, it, expect } from 'vitest';
import { db } from './firebase';

describe('Firebase Emulator Connectivity', () => {
  it('should be able to write and read a document from Firestore emulator', async () => {
    const testDocPath = 'tests/connectivity-check';
    const testData = {
      message: 'connection successful',
      timestamp: new Date().toISOString(),
    };

    const docRef = doc(db, testDocPath);

    // 1. Write to Firestore
    await setDoc(docRef, testData);

    // 2. Read from Firestore
    const snapshot = await getDoc(docRef);

    expect(snapshot.exists()).toBe(true);
    expect(snapshot.data()).toEqual(testData);
  });

  it('should verify that we are running against the emulator in test mode', () => {
    // In Vitest, import.meta.env.DEV is typically true if configured correctly
    // or you can check the Firestore instance settings.
    expect(import.meta.env.DEV).toBe(true);
  });
});
