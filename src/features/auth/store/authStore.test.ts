import type { User } from 'firebase/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const onAuthStateChangedMock = vi.fn();

vi.mock('@/api/auth', () => ({
  onAuthStateChanged: onAuthStateChangedMock,
}));

const { useAuthStore } = await import('./authStore');

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      loading: true,
      initialized: false,
    });
  });

  it('initializes the auth subscription only once', () => {
    const unsubscribe = vi.fn();
    onAuthStateChangedMock.mockReturnValue(unsubscribe);

    useAuthStore.getState().initialize();
    useAuthStore.getState().initialize();

    expect(onAuthStateChangedMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().initialized).toBe(true);
  });

  it('updates state from auth subscription callbacks', () => {
    let callback: ((user: User | null) => void) | undefined;

    onAuthStateChangedMock.mockImplementation(
      (cb: (user: User | null) => void) => {
        callback = cb;
        return vi.fn();
      }
    );

    useAuthStore.getState().initialize();

    callback?.({ uid: 'user-1', email: 'cook@example.com' } as User);

    expect(useAuthStore.getState().user?.uid).toBe('user-1');
    expect(useAuthStore.getState().loading).toBe(false);
  });
});
