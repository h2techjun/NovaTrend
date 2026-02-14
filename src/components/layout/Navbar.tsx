'use client';

import { Link, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import LocaleSwitcher from '@/components/common/LocaleSwitcher';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Bitcoin,
  Music,
  MessageSquare,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRole } from '@/hooks/useRole';
import AuthModal from '@/components/auth/AuthModal';
import NotificationCenter from '@/components/layout/NotificationCenter';

const NAV_ITEMS = [
  { href: '/stock', key: 'stock', icon: TrendingUp },
  { href: '/crypto', key: 'crypto', icon: Bitcoin },
  { href: '/kpop', key: 'kpop', icon: Music },
  { href: '/community', key: 'community', icon: MessageSquare },
];

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, profile, loading, signOut } = useAuth();
  const { canModerate } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))/0.8] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="NovaTrend"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-xl font-bold gradient-text hidden sm:inline">
              NovaTrend
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-brand-600/10 text-brand-600 dark:text-brand-400'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          {/* 우측 액션 */}
          <div className="flex items-center gap-2">
            {/* 언어 선택 */}
            <LocaleSwitcher />

            {/* 테마 전환 */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label={t('toggleTheme')}
            >
              <Sun className="h-5 w-5 hidden dark:block" />
              <Moon className="h-5 w-5 block dark:hidden" />
            </button>

            {/* 알림 센터 (로그인 시에만 노출) */}
            {user && <NotificationCenter />}

            {/* 로그인/유저 버튼 */}
            {!loading && (
              user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {profile?.username?.charAt(0).toUpperCase() || <User className="h-3 w-3" />}
                    </div>
                    <span className="hidden sm:inline">{profile?.username || t('userDefault')}</span>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden z-50"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="p-3 border-b border-[hsl(var(--border))]">
                        <p className="text-sm font-semibold">{profile?.display_name || profile?.username}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                      >
                        <User className="h-4 w-4" />
                        {t('myProfile')}
                      </Link>
                      {canModerate && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                          {t('adminDashboard')}
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await signOut();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('login')}</span>
                </button>
              )
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              aria-label={t('menu')}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-[hsl(var(--border))] px-4 py-3 space-y-1 animate-slide-up">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-600/10 text-brand-600'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {t(item.key)}
                </Link>
              );
            })}

            {/* 모바일 로그인/로그아웃 */}
            {!loading && !user && (
              <button
                onClick={() => { setMobileOpen(false); setAuthModalOpen(true); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-600"
              >
                <LogIn className="h-5 w-5" />
                {t('login')}
              </button>
            )}
          </nav>
        )}
      </header>

      {/* 로그인 모달 */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
