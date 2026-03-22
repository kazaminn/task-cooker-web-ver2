import { useNavigate } from 'react-router';
import { signInWithGoogle } from '@/services/authService';
import { createUser, getUser } from '@/services/authService';
import { createPersonalTeam } from '@/services/teamService';
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
        <span className="text-primary text-2xl font-bold">Task Cooker</span>
        <h2 className="mt-4 text-xl font-semibold text-body">
          かざみんの酒場へようこそ
        </h2>
      </div>
      <GoogleLoginButton onLogin={handleSignup} label="Google でサインアップ" />
      <p className="text-center text-sm text-muted">
        <Link href="/login">すでにアカウントをお持ちの方はログイン</Link>
      </p>
    </AuthCard>
  );
}
