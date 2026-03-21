import { FirebaseError } from 'firebase/app';
import {
  linkCurrentUserWithGoogle,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
} from '@/api/auth';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        const message = getErrorMessage(e.code);
        throw new Error(message);
      }
      throw new Error('ログインに失敗しました');
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        const message = getErrorMessage(e.code);
        throw new Error(message);
      }
      throw new Error('ログアウトに失敗しました');
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        const message = getErrorMessage(e.code);
        throw new Error(message);
      }
      throw new Error('アカウント作成に失敗しました');
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        const message = getErrorMessage(e.code);
        throw new Error(message);
      }
      throw new Error('Googleログインに失敗しました');
    }
  };

  const linkWithGoogle = async () => {
    try {
      await linkCurrentUserWithGoogle();
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        const message = getErrorMessage(e.code);
        throw new Error(message);
      }
      throw new Error('Googleアカウントの連携に失敗しました');
    }
  };

  const sendResetMail = async (email: string) => {
    try {
      await sendPasswordReset(email);
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        const message = getErrorMessage(e.code);
        throw new Error(message);
      }
      throw new Error('パスワードリセットメールの送信に失敗しました');
    }
  };

  return {
    currentUser: store.user,
    user: store.user,
    loading: store.loading,
    isAuthenticated: !!store.user,
    login,
    logout,
    signup,
    loginWithGoogle,
    linkWithGoogle,
    sendResetMail,
  };
};

const getErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'ユーザーが見つかりません',
    'auth/wrong-password': 'パスワードが間違っています',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/weak-password': 'パスワードが弱すぎます',
    'auth/invalid-email': 'メールアドレスが無効です',
    'auth/user-disabled': 'このアカウントは無効化されています',
    'auth/too-many-requests':
      'リクエストが多すぎます。しばらく待ってから再試行してください',
    'auth/popup-closed-by-user': 'ポップアップがキャンセルされました',
    'auth/popup-blocked': 'ポップアップがブロックされました',
    'auth/credential-already-in-use':
      'この認証情報は既に別のアカウントで使用されています',
    'auth/account-exists-with-different-credential':
      '異なる認証方法で同じメールアドレスのアカウントが存在します',
  };
  return messages[code] || '操作に失敗しました';
};
