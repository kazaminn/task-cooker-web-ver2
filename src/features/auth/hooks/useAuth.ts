import { useEffect, useState, createContext, useContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from '@/api/auth';

interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setState({ user, loading: false });
    });
    return unsubscribe;
  }, []);

  return state;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
