import { create } from 'zustand';
import type {
  TaskFilter,
  Toast,
  ModalType,
  DrawerType,
  ProjectTab,
} from '@/types/types';

type ViewMode = 'list' | 'kanban';
type Theme = 'light' | 'dark' | 'system';

interface UIState {
  theme: Theme;
  selectedView: ViewMode;
  filters: TaskFilter;
  searchQuery: string;
  activeModal: ModalType;
  activeDrawer: DrawerType;
  isUserMenuOpen: boolean;
  activeProjectTab: ProjectTab;
  toasts: Toast[];
  reducedMotion: boolean;

  setTheme: (theme: Theme) => void;
  setSelectedView: (view: ViewMode) => void;
  setFilters: (filters: Partial<TaskFilter>) => void;
  setSearchQuery: (query: string) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  openDrawer: (drawer: DrawerType) => void;
  closeDrawer: () => void;
  setUserMenuOpen: (open: boolean) => void;
  setActiveProjectTab: (tab: ProjectTab) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setReducedMotion: (value: boolean) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) ?? 'system';
}

function resolveTheme(theme: Theme): Exclude<Theme, 'system'> {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  selectedView: 'list',
  filters: {},
  searchQuery: '',
  activeModal: 'none',
  activeDrawer: 'none',
  isUserMenuOpen: false,
  activeProjectTab: 'overview',
  toasts: [],
  reducedMotion: false,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    set({ theme });
  },
  setSelectedView: (selectedView) => set({ selectedView }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: 'none' }),
  openDrawer: (activeDrawer) => set({ activeDrawer }),
  closeDrawer: () => set({ activeDrawer: 'none' }),
  setUserMenuOpen: (isUserMenuOpen) => set({ isUserMenuOpen }),
  setActiveProjectTab: (activeProjectTab) => set({ activeProjectTab }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolvedTheme = resolveTheme(theme);
  root.setAttribute('data-theme', resolvedTheme);
  root.setAttribute('data-theme-mode', theme);
  root.style.colorScheme = resolvedTheme;
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  applyTheme(getInitialTheme());

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const currentTheme = useUIStore.getState().theme;
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    });
}
