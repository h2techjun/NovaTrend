'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/components/auth/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';

const NAV_ITEMS = [
  { href: '/stock', label: '주식', icon: TrendingUp },
  { href: '/crypto', label: '크립토', icon: Bitcoin },
  { href: '/kpop', label: 'K-POP', icon: Music },
  { href: '/community', label: '커뮤니티', icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, profile, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))/0.8] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              NT
            </div>
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
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 우측 액션 */}
          <div className="flex items-center gap-2">
            {/* 테마 전환 */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label="테마 전환"
            >
              <Sun className="h-5 w-5 hidden dark:block" />
              <Moon className="h-5 w-5 block dark:hidden" />
            </button>

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
                    <span className="hidden sm:inline">{profile?.username || '사용자'}</span>
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
                      <button
                        onClick={async () => {
                          await signOut();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        로그아웃
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
                  <span className="hidden sm:inline">로그인</span>
                </button>
              )
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              aria-label="메뉴"
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
                  {item.label}
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
                로그인
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
