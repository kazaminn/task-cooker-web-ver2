import React from 'react';
import { useNavigate } from 'react-router';
import { signOut } from '@/api/auth';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/ui/components/Button';
import { Switch } from '@/ui/components/Switch';
import {
  ToggleButton,
  ToggleButtonGroup,
} from '@/ui/components/ToggleButtonGroup';

export function AppSettingsPage() {
  const navigate = useNavigate();
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);

  const handleSignOut = async () => {
    await signOut();
    void navigate('/login');
  };

  return (
    <div className="mx-auto max-w-xl space-y-8 p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        設定
      </h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          テーマ
        </h2>
        <ToggleButtonGroup
          selectionMode="single"
          selectedKeys={new Set([theme])}
          onSelectionChange={(keys) => {
            const key = [...keys][0] as 'light' | 'dark' | 'system';
            if (key) setTheme(key);
          }}
        >
          <ToggleButton id="light">Light</ToggleButton>
          <ToggleButton id="dark">Dark</ToggleButton>
          <ToggleButton id="system">System</ToggleButton>
        </ToggleButtonGroup>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          アクセシビリティ
        </h2>
        <Switch isSelected={reducedMotion} onChange={setReducedMotion}>
          モーション軽減
        </Switch>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          アカウント
        </h2>
        <Button variant="secondary" onPress={() => void handleSignOut()}>
          ログアウト
        </Button>
      </section>
    </div>
  );
}
