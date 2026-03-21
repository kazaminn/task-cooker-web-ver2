import React from 'react';
import { useNavigate } from 'react-router';
import { signInWithGoogle } from '@/api/auth';
import { Link } from '@/ui/components/Link';
import { AuthCard } from '../components/AuthCard';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await signInWithGoogle();
    void navigate('/home');
  };

  return (
    <AuthCard>
      <div className="text-center">
        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          Task Cooker
        </span>
        <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
          おかえりなさい、店主
        </h2>
      </div>
      <GoogleLoginButton onLogin={handleLogin} />
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        <Link href="/signup">アカウントがない方はサインアップ</Link>
      </p>
    </AuthCard>
  );
}
