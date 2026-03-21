import React, { useState } from 'react';
import {
  faBars,
  faUser,
  faGear,
  faRightFromBracket,
  faXmark,
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

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-3 text-sm font-medium border-b border-slate-100 dark:border-slate-700 ${
    isActive
      ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
      : 'text-slate-700 dark:text-slate-300'
  }`;

export function TopNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    void navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex items-center gap-2">
          <Button
            variant="quiet"
            aria-label={
              isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'
            }
            onPress={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faXmark : faBars} />
          </Button>
          <NavLink
            to="/home"
            className="text-base font-bold text-orange-600 dark:text-orange-400"
          >
            Task Cooker
          </NavLink>
        </div>

        <nav
          className="hidden items-center gap-1 sm:flex"
          aria-label="メインナビゲーション"
        >
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

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <nav
          className="fixed inset-x-0 top-12 z-30 border-b border-slate-200 bg-white shadow-lg sm:hidden dark:border-slate-700 dark:bg-slate-800"
          aria-label="モバイルナビゲーション"
        >
          <NavLink
            to="/home"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            Projects
          </NavLink>
          <NavLink
            to="/teams"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            Teams
          </NavLink>
          <NavLink
            to="/profile"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            プロフィール
          </NavLink>
          <NavLink
            to="/settings"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            設定
          </NavLink>
        </nav>
      )}
    </>
  );
}
