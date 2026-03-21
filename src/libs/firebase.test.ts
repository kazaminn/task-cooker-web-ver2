import { beforeEach, describe, expect, it, vi } from 'vitest';

const initializeAppMock = vi.fn();
const getAppsMock = vi.fn(() => []);
const getAppMock = vi.fn();
const getAuthMock = vi.fn(() => ({ currentUser: null }));
const connectAuthEmulatorMock = vi.fn();
const getFirestoreMock = vi.fn(() => ({ __brand: 'firestore' }));
const connectFirestoreEmulatorMock = vi.fn();

vi.mock('firebase/app', () => ({
  initializeApp: initializeAppMock,
  getApps: getAppsMock,
  getApp: getAppMock,
}));

vi.mock('firebase/auth', () => ({
  getAuth: getAuthMock,
  connectAuthEmulator: connectAuthEmulatorMock,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: getFirestoreMock,
  connectFirestoreEmulator: connectFirestoreEmulatorMock,
}));

describe('firebase bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getAppsMock.mockReturnValue([]);
    initializeAppMock.mockReturnValue({ name: 'mock-app' });
    getAuthMock.mockReturnValue({ currentUser: null });
    getFirestoreMock.mockReturnValue({ __brand: 'firestore' });
    delete (
      globalThis as typeof globalThis & {
        _firebase_emulators_connected?: boolean;
      }
    )._firebase_emulators_connected;
  });

  it('uses getFirestore during startup', async () => {
    await import('./firebase');

    expect(getFirestoreMock).toHaveBeenCalledTimes(1);
  });

  it('connects emulators only once per runtime', async () => {
    vi.stubEnv('VITE_USE_EMULATOR', 'true');
    vi.stubEnv('VITE_AUTH_EMULATOR_HOST', 'http://localhost:9099');
    vi.stubEnv('VITE_FIRESTORE_EMULATOR_HOST', 'localhost:8080');

    await import('./firebase');
    expect(connectAuthEmulatorMock).toHaveBeenCalledTimes(1);
    expect(connectFirestoreEmulatorMock).toHaveBeenCalledTimes(1);

    vi.resetModules();
    await import('./firebase');
    expect(connectAuthEmulatorMock).toHaveBeenCalledTimes(1);
    expect(connectFirestoreEmulatorMock).toHaveBeenCalledTimes(1);

    vi.unstubAllEnvs();
  });
});
