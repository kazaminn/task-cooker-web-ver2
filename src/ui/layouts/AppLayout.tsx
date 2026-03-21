import { Outlet } from 'react-router';
import { TopNav } from './TopNav';
import { pageContainerClass } from './pageContainer';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-base">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        メインコンテンツへスキップ
      </a>
      <TopNav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className={`${pageContainerClass} flex min-h-full`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
