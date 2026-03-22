import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signInWithEmail, signInWithGoogle } from '@/services/authService';
import { Button } from '@/ui/components/Button';
import { Link } from '@/ui/components/Link';
import { TextField } from '@/ui/components/TextField';
import { AuthCard } from '../components/AuthCard';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    void navigate('/home');
  };

  const handleEmailLogin = async () => {
    setError(null);
    try {
      await signInWithEmail(email, password);
      void navigate('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ログインに失敗しました');
    }
  };

  return (
    <AuthCard>
      <div className="text-center">
        <span className="text-primary text-2xl font-bold">Task Cooker</span>
        <h2 className="mt-4 text-xl font-semibold text-body">
          おかえりなさい、店主
        </h2>
      </div>

      <div className="space-y-3">
        <TextField label="メールアドレス" value={email} onChange={setEmail} />
        <TextField
          label="パスワード"
          type="password"
          value={password}
          onChange={setPassword}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button
          variant="primary"
          onPress={() => void handleEmailLogin()}
          className="w-full"
        >
          ログイン
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-main h-px flex-1" />
        <span className="text-xs text-muted">または</span>
        <div className="bg-main h-px flex-1" />
      </div>

      <GoogleLoginButton onLogin={handleGoogleLogin} />

      <p className="text-center text-sm text-muted">
        <Link href="/signup">アカウントがない方はサインアップ</Link>
      </p>
    </AuthCard>
  );
}
