import React from 'react';
import { useNavigate } from 'react-router';
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
          Task Cooker
        </span>
        <Button variant="quiet" onPress={() => void navigate('/login')}>
          ログイン
        </Button>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
          かざみんの酒場へようこそ
        </h1>
        <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
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

      <footer className="border-t border-slate-200 px-6 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Task Cooker
      </footer>
    </div>
  );
}
