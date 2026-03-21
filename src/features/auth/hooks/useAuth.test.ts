import { renderHook } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../store/authStore';
import { useAuth } from './useAuth';

const authApiMock = vi.hoisted(() => ({
  linkCurrentUserWithGoogle: vi.fn(),
  sendPasswordReset: vi.fn(),
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  signUpWithEmail: vi.fn(),
}));

vi.mock('@/api/auth', () => authApiMock);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { uid: 'user-1', email: 'cook@example.com' } as never,
      loading: false,
      initialized: true,
    });
  });

  it('exposes auth state from the store', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user?.uid).toBe('user-1');
    expect(result.current.currentUser?.uid).toBe('user-1');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('delegates login to the auth api', async () => {
    authApiMock.signInWithEmail.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth());

    await result.current.login('cook@example.com', 'secret');

    expect(authApiMock.signInWithEmail).toHaveBeenCalledWith(
      'cook@example.com',
      'secret'
    );
  });

  it('maps Firebase errors to user-facing messages', async () => {
    authApiMock.signInWithGoogle.mockRejectedValue(
      new FirebaseError('auth/popup-blocked', 'blocked')
    );
    const { result } = renderHook(() => useAuth());

    await expect(result.current.loginWithGoogle()).rejects.toThrow(
      'ポップアップがブロックされました'
    );
  });
});
