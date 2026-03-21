import React from 'react';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-600">
        404
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400">
        ページが見つかりません
      </p>
      <Link
        to="/home"
        className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
      >
        ダッシュボードに戻る
      </Link>
    </div>
  );
}
