import { useState } from 'react';
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
      ? 'bg-primary/10 text-primary'
      : 'text-muted hover:text-body hover:bg-hover'
  }`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-3 text-sm font-medium border-b border-main ${
    isActive ? 'bg-primary/5 text-primary' : 'text-body'
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
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-main bg-base/95 px-4 backdrop-blur">
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
          <NavLink to="/home" className="text-primary text-base font-bold">
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
                  <span className="text-primary flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
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
          className="fixed inset-x-0 top-12 z-30 border-b border-main bg-surface shadow-lg sm:hidden"
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
