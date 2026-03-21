import { onAuthStateChanged, type Unsubscribe, type User } from 'firebase/auth';
import { create } from 'zustand';
import { auth } from '@/api/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => void;
  cleanup: () => void;
}

let unsubscribe: Unsubscribe | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;

    set({ initialized: true });

    unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },

  cleanup: () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    set({ initialized: false });
  },
}));
