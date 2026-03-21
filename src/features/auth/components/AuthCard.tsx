import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-main bg-surface p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
