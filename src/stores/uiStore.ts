import { create } from 'zustand';
import type {
  TaskFilter,
  Toast,
  ModalType,
  DrawerType,
  ProjectTab,
} from '@/types/types';

type ViewMode = 'list' | 'kanban';
type Theme = 'tavern-light' | 'tavern-dark';

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
  if (typeof window === 'undefined') return 'tavern-light';
  const stored = localStorage.getItem('tck-theme');
  if (stored === 'tavern-light' || stored === 'tavern-dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'tavern-dark'
    : 'tavern-light';
}

function getInitialReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const storedValue = localStorage.getItem('reducedMotion') ?? undefined;
  if (storedValue !== undefined) {
    return storedValue === 'true';
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  reducedMotion: getInitialReducedMotion(),

  setTheme: (theme) => {
    localStorage.setItem('tck-theme', theme);
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
  setReducedMotion: (reducedMotion) => {
    localStorage.setItem('reducedMotion', String(reducedMotion));
    applyReducedMotion(reducedMotion);
    set({ reducedMotion });
  },
}));

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme === 'tavern-dark' ? 'dark' : 'light';
}

function applyReducedMotion(reducedMotion: boolean) {
  const root = document.documentElement;
  root.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false');
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  applyTheme(getInitialTheme());
  applyReducedMotion(getInitialReducedMotion());

  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', (event) => {
      if ((localStorage.getItem('reducedMotion') ?? undefined) === undefined) {
        applyReducedMotion(event.matches);
        useUIStore.setState({ reducedMotion: event.matches });
      }
    });
}
