import React from 'react';
import { Outlet } from 'react-router';
import { TopNav } from './TopNav';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-900">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
