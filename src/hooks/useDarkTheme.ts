import { useUIStore } from '@/stores/uiStore';

export function useDarkTheme() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  const isDark = theme === 'tavern-dark';

  return { theme, setTheme, isDark };
}
