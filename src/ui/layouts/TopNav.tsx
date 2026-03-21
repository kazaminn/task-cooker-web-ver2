import React from 'react';
import {
  faUser,
  faGear,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useNavigate } from 'react-router';
import { signOut } from '@/api/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/ui/components/Button';
import { Menu, MenuItem, MenuTrigger } from '@/ui/components/Menu';
import { Popover } from '@/ui/components/Popover';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700'
  }`;

export function TopNav() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    void navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <NavLink
        to="/home"
        className="text-base font-bold text-orange-600 dark:text-orange-400"
      >
        Task Cooker
      </NavLink>

      <nav className="hidden items-center gap-1 sm:flex">
        <NavLink to="/home" className={navLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/projects" className={navLinkClass}>
          Projects
        </NavLink>
      </nav>

      <div className="flex items-center gap-2">
        {user && (
          <MenuTrigger>
            <Button variant="quiet" aria-label="ユーザーメニュー">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-7 w-7 rounded-full"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  {user.displayName?.[0] ?? user.email?.[0] ?? '?'}
                </span>
              )}
            </Button>
            <Popover placement="bottom end">
              <Menu
                onAction={(key) => {
                  if (key === 'profile') void navigate('/profile');
                  else if (key === 'settings') void navigate('/settings');
                  else if (key === 'logout') void handleSignOut();
                }}
              >
                <MenuItem id="profile">
                  <FontAwesomeIcon icon={faUser} className="mr-2 w-4" />
                  プロフィール
                </MenuItem>
                <MenuItem id="settings">
                  <FontAwesomeIcon icon={faGear} className="mr-2 w-4" />
                  設定
                </MenuItem>
                <MenuItem id="logout">
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    className="mr-2 w-4"
                  />
                  ログアウト
                </MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
        )}
      </div>
    </header>
  );
}
