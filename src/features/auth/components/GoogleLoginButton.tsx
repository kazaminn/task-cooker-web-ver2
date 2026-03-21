import React, { useState } from 'react';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/ui/components/Button';

interface GoogleLoginButtonProps {
  onLogin: () => Promise<void>;
  label?: string;
}

export function GoogleLoginButton({
  onLogin,
  label = 'Google でログイン',
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="secondary"
        onPress={() => void handlePress()}
        isDisabled={isLoading}
      >
        <FontAwesomeIcon icon={faGoogle} />
        {isLoading ? 'ログイン中...' : label}
      </Button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
