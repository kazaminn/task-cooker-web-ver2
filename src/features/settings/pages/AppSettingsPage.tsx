import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { signOut, updateCurrentUserProfile } from '@/services/authService';
import { getUser, updateUser } from '@/services/authService';
import { useUIStore } from '@/stores/uiStore';
import type { ProfileFormInput } from '@/types/types';
import { Button } from '@/ui/components/Button';
import { Switch } from '@/ui/components/Switch';
import { TextArea } from '@/ui/components/TextArea';
import { TextField } from '@/ui/components/TextField';
import { ToggleButton } from '@/ui/components/ToggleButton';
import { ToggleButtonGroup } from '@/ui/components/ToggleButtonGroup';

export function AppSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<ProfileFormInput>({
    defaultValues: {
      displayName: user?.displayName ?? '',
      bio: '',
      photoURL: user?.photoURL ?? '',
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.uid) {
        reset({ displayName: '', bio: '', photoURL: '' });
        return;
      }

      const profile = await getUser(user.uid);
      if (!isMounted) return;

      reset({
        displayName: profile?.displayName ?? user.displayName ?? '',
        bio: profile?.bio ?? '',
        photoURL: profile?.photoURL ?? user.photoURL ?? '',
      });
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [reset, user?.displayName, user?.photoURL, user?.uid]);

  const handleSignOut = async () => {
    await signOut();
    void navigate('/');
  };

  const handleSaveProfile = async (values: ProfileFormInput) => {
    if (!user?.uid) return;

    setIsSavingProfile(true);
    setProfileError(null);

    try {
      const displayName = values.displayName.trim();
      const bio = values.bio?.trim();

      await updateCurrentUserProfile({ displayName });
      await updateUser(user.uid, {
        displayName,
        bio: bio && bio.length > 0 ? bio : undefined,
      });

      reset({
        displayName,
        bio: bio ?? '',
        photoURL: user.photoURL ?? '',
      });
    } catch {
      setProfileError('プロフィールの保存に失敗しました');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="w-full space-y-8 py-6">
      <h1 className="text-2xl font-bold text-body">設定</h1>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-body">プロフィール</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(handleSaveProfile)(e);
          }}
        >
          <Controller
            name="displayName"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                label="表示名"
                value={field.value}
                onChange={field.onChange}
                isRequired
              />
            )}
          />
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <TextArea
                label="自己紹介"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="ひとこと紹介"
              />
            )}
          />
          {profileError && (
            <p className="text-sm text-danger">{profileError}</p>
          )}
          <Button variant="primary" type="submit" isPending={isSavingProfile}>
            保存
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-body">テーマ</h2>
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
        <h2 className="text-sm font-semibold text-body">アクセシビリティ</h2>
        <Switch isSelected={reducedMotion} onChange={setReducedMotion}>
          モーション軽減
        </Switch>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-body">アカウント</h2>
        <Button variant="secondary" onPress={() => void handleSignOut()}>
          ログアウト
        </Button>
      </section>
    </div>
  );
}
