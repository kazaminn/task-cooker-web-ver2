import React, { useMemo } from 'react';
import { AuthContext, useAuthState } from '../hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthState();
  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
