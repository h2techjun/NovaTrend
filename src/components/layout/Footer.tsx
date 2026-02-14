'use client';

import { Link } from '@/navigation';
import { TrendingUp, Bitcoin, Music, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* 브랜드 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white shadow-lg shadow-brand-600/20">
                NT
              </div>
              <span className="font-black text-xl tracking-tight">NovaTrend</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* 대시보드 */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[hsl(var(--foreground))] mb-4">{t('dashboards')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/stock" className="flex items-center gap-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-brand-600 transition-colors">
                  <TrendingUp className="h-4 w-4" /> {tNav('stock')}
                </Link>
              </li>
              <li>
                <Link href="/crypto" className="flex items-center gap-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-brand-600 transition-colors">
                  <Bitcoin className="h-4 w-4" /> {tNav('crypto')}
                </Link>
              </li>
              <li>
                <Link href="/kpop" className="flex items-center gap-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-brand-600 transition-colors">
                  <Music className="h-4 w-4" /> {tNav('kpop')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 커뮤니티 */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[hsl(var(--foreground))] mb-4">{t('communityTitle')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/community" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-brand-600 transition-colors">
                  {t('board')}
                </Link>
              </li>
              <li>
                <Link href="/community/rules" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-brand-600 transition-colors">
                  {t('rules')}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-brand-600 transition-colors">
                  {t('report')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 파트너 */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[hsl(var(--foreground))] mb-4">{t('partners')}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://doctranslation.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-brand-600 transition-colors group"
                >
                  <ExternalLink className="h-4 w-4 text-brand-600/50 group-hover:text-brand-600" /> DocTranslation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 면책 조항 */}
        <div className="mt-12 border-t border-[hsl(var(--border))] pt-8 text-center sm:text-left">
          <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] leading-relaxed max-w-4xl">
            {t('disclaimer')}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] font-medium">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
            <p className="text-[10px] sm:text-xs text-brand-600/50 font-bold uppercase tracking-wider">
              {t('poweredBy')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
