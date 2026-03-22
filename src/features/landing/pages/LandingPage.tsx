import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/ui/components/Button';
import { Link } from '@/ui/components/Link';

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-main bg-surface p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-body">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

export function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <p className="text-muted">読み込み中...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-base">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-primary text-lg font-bold">Task Cooker</span>
        <Button variant="quiet" onPress={() => void navigate('/login')}>
          ログイン
        </Button>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-body">
          かざみんの酒場へようこそ
        </h1>
        <p className="mb-8 text-lg text-muted">
          料理メタファーで楽しくタスク管理 — 注文 → 仕込み → 調理 → 提供
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="primary" onPress={() => void navigate('/signup')}>
            始める
          </Button>
          <Link href="/login">ログイン</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-6 px-6 pb-20 sm:grid-cols-3">
        <FeatureCard
          title="カンバンボード"
          description="注文・仕込み・調理・提供の4つのステージでタスクを管理"
        />
        <FeatureCard
          title="草グラフ"
          description="パンケーキの焼き色で貢献度を可視化。毎日の頑張りが一目でわかる"
        />
        <FeatureCard
          title="ダークモード"
          description="目に優しいダークモードで夜の作業も快適に"
        />
      </section>

      <footer className="border-t border-main px-6 py-6 text-center text-sm text-muted">
        Task Cooker
      </footer>
    </div>
  );
}
