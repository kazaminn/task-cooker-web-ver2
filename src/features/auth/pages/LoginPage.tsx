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
        <span className="text-primary text-2xl font-bold">Task Cooker</span>
        <h2 className="mt-4 text-xl font-semibold text-body">
          おかえりなさい、店主
        </h2>
      </div>
      <GoogleLoginButton onLogin={handleLogin} />
      <p className="text-center text-sm text-muted">
        <Link href="/signup">アカウントがない方はサインアップ</Link>
      </p>
    </AuthCard>
  );
}
