import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from './AuthGuard';

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state while auth is resolving', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    const router = createMemoryRouter(
      [
        {
          element: <AuthGuard />,
          children: [{ path: '/', element: <div>protected</div> }],
        },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    const router = createMemoryRouter(
      [
        {
          element: <AuthGuard />,
          children: [{ path: '/', element: <div>protected</div> }],
        },
        { path: '/login', element: <div>login page</div> },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  it('renders child routes for authenticated users', async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    const router = createMemoryRouter(
      [
        {
          element: <AuthGuard />,
          children: [{ path: '/', element: <div>protected</div> }],
        },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('protected')).toBeInTheDocument();
  });
});
