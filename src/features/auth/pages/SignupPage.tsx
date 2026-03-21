import React from 'react';
import { useNavigate } from 'react-router';
import { signInWithGoogle } from '@/api/auth';
import { createPersonalTeam } from '@/api/teams';
import { createUser, getUser } from '@/api/users';
import { Link } from '@/ui/components/Link';
import { AuthCard } from '../components/AuthCard';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

export function SignupPage() {
  const navigate = useNavigate();

  const handleSignup = async () => {
    const firebaseUser = await signInWithGoogle();
    const existingUser = await getUser(firebaseUser.uid);

    if (!existingUser) {
      await createUser(firebaseUser.uid, {
        displayName: firebaseUser.displayName ?? '',
        email: firebaseUser.email ?? '',
        photoURL: firebaseUser.photoURL ?? undefined,
      });
      await createPersonalTeam(firebaseUser.uid);
    }

    void navigate('/home');
  };

  return (
    <AuthCard>
      <div className="text-center">
        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          Task Cooker
        </span>
        <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
          かざみんの酒場へようこそ
        </h2>
      </div>
      <GoogleLoginButton onLogin={handleSignup} label="Google でサインアップ" />
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        <Link href="/login">すでにアカウントをお持ちの方はログイン</Link>
      </p>
    </AuthCard>
  );
}
