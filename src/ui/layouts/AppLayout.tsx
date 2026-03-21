import { Outlet } from 'react-router';
import { TopNav } from './TopNav';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-orange-600 focus:px-4 focus:py-2 focus:text-white"
      >
        メインコンテンツへスキップ
      </a>
      <TopNav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
