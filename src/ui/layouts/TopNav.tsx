import { useState } from 'react';
import {
  faBars,
  faDesktop,
  faGear,
  faMoon,
  faXmark,
  faRightFromBracket,
  faSun,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useNavigate } from 'react-router';
import { signOut } from '@/api/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDarkTheme } from '@/hooks/useDarkTheme';
import { Avatar } from '@/ui/components/Avatar';
import { Button } from '@/ui/components/Button';
import { Menu, MenuItem, MenuTrigger } from '@/ui/components/Menu';
import { ToggleButton } from '@/ui/components/ToggleButton';
import { ToggleButtonGroup } from '@/ui/components/ToggleButtonGroup';
import { pageContainerClass } from './pageContainer';

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
  const { theme, setTheme } = useDarkTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    void navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-main bg-base/95 backdrop-blur">
        <div
          className={`${pageContainerClass} flex h-12 items-center justify-between`}
        >
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
            <NavLink to="/teams" className={navLinkClass}>
              Teams
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ToggleButtonGroup
              aria-label="テーマ切り替え"
              selectionMode="single"
              selectedKeys={new Set([theme])}
              onSelectionChange={(keys) => {
                const key = [...keys][0] as
                  | 'light'
                  | 'dark'
                  | 'system'
                  | undefined;
                if (key) setTheme(key);
              }}
              className="hidden sm:flex"
            >
              <ToggleButton
                id="light"
                aria-label="ライトモード"
                className="h-8 w-8 rounded-full"
              >
                <FontAwesomeIcon icon={faSun} />
              </ToggleButton>
              <ToggleButton
                id="dark"
                aria-label="ダークモード"
                className="h-8 w-8 rounded-full"
              >
                <FontAwesomeIcon icon={faMoon} />
              </ToggleButton>
              <ToggleButton
                id="system"
                aria-label="システム設定に合わせる"
                className="h-8 w-8 rounded-full"
              >
                <FontAwesomeIcon icon={faDesktop} />
              </ToggleButton>
            </ToggleButtonGroup>
            {user && (
              <MenuTrigger>
                <Button
                  variant="quiet"
                  aria-label="ユーザーメニュー"
                  className="rounded-full bg-transparent p-0 hover:bg-transparent pressed:bg-transparent"
                >
                  <Avatar
                    src={user.photoURL ?? undefined}
                    fallback={user.displayName?.[0] ?? user.email?.[0] ?? '?'}
                    size="md"
                    className="h-9 w-9 border-main/60"
                  />
                </Button>
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
              </MenuTrigger>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <nav
          className="fixed inset-x-0 top-12 z-30 border-b border-main bg-surface shadow-lg sm:hidden"
          aria-label="モバイルナビゲーション"
        >
          <div className={pageContainerClass}>
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
          </div>
        </nav>
      )}
    </>
  );
}
