import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-6xl font-bold text-disabled">404</h1>
      <p className="text-lg text-muted">ページが見つかりません</p>
      <Link
        to="/home"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
      >
        ダッシュボードに戻る
      </Link>
    </div>
  );
}
