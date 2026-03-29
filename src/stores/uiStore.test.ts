import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock matchMedia before importing the store
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const { useUIStore } = await import('./uiStore');

describe('uiStore', () => {
  beforeEach(() => {
    const { setState } = useUIStore;
    setState({
      theme: 'tavern-light',
      selectedView: 'list',
      filters: {},
      searchQuery: '',
      activeModal: 'none',
      activeDrawer: 'none',
      isUserMenuOpen: false,
      activeProjectTab: 'overview',
      toasts: [],
      reducedMotion: false,
    });
    localStorage.clear();
  });

  it('sets theme', () => {
    useUIStore.getState().setTheme('tavern-dark');
    expect(useUIStore.getState().theme).toBe('tavern-dark');
  });

  it('sets selected view', () => {
    useUIStore.getState().setSelectedView('kanban');
    expect(useUIStore.getState().selectedView).toBe('kanban');
  });

  it('sets filters', () => {
    useUIStore.getState().setFilters({ status: ['prep'] });
    expect(useUIStore.getState().filters.status).toEqual(['prep']);
  });

  it('merges filters', () => {
    useUIStore.getState().setFilters({ status: ['prep'] });
    useUIStore.getState().setFilters({ priority: ['high'] });
    expect(useUIStore.getState().filters.status).toEqual(['prep']);
    expect(useUIStore.getState().filters.priority).toEqual(['high']);
  });

  it('sets search query', () => {
    useUIStore.getState().setSearchQuery('test');
    expect(useUIStore.getState().searchQuery).toBe('test');
  });

  it('opens and closes modal', () => {
    useUIStore.getState().openModal('project_create');
    expect(useUIStore.getState().activeModal).toBe('project_create');
    useUIStore.getState().closeModal();
    expect(useUIStore.getState().activeModal).toBe('none');
  });

  it('opens and closes drawer', () => {
    useUIStore.getState().openDrawer('mobile_nav');
    expect(useUIStore.getState().activeDrawer).toBe('mobile_nav');
    useUIStore.getState().closeDrawer();
    expect(useUIStore.getState().activeDrawer).toBe('none');
  });

  it('adds and removes toasts', () => {
    useUIStore.getState().addToast({ type: 'success', message: 'Done!' });
    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Done!');

    useUIStore.getState().removeToast(toasts[0].id);
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });

  it('sets reduced motion', () => {
    useUIStore.getState().setReducedMotion(true);
    expect(useUIStore.getState().reducedMotion).toBe(true);
  });

  it('sets active project tab', () => {
    useUIStore.getState().setActiveProjectTab('tasks');
    expect(useUIStore.getState().activeProjectTab).toBe('tasks');
  });

  describe('tavern theme', () => {
    it('restores theme from localStorage tck-theme', () => {
      localStorage.setItem('tck-theme', 'tavern-dark');
      useUIStore.getState().setTheme('tavern-dark');
      expect(localStorage.getItem('tck-theme')).toBe('tavern-dark');
      expect(useUIStore.getState().theme).toBe('tavern-dark');
    });

    it('toggles between tavern-light and tavern-dark', () => {
      expect(useUIStore.getState().theme).toBe('tavern-light');

      useUIStore.getState().setTheme('tavern-dark');
      expect(useUIStore.getState().theme).toBe('tavern-dark');

      useUIStore.getState().setTheme('tavern-light');
      expect(useUIStore.getState().theme).toBe('tavern-light');
    });

    it('applies data-theme attribute to document element', () => {
      useUIStore.getState().setTheme('tavern-dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        'tavern-dark'
      );

      useUIStore.getState().setTheme('tavern-light');
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        'tavern-light'
      );
    });
  });
});
