'use client';

import { Link } from '@/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  TrendingUp,
  Bitcoin,
  Music,
  ArrowRight,
  Sparkles,
  Shield,
  BarChart3,
} from 'lucide-react';

const DASHBOARD_KEYS = [
  {
    href: '/stock',
    icon: TrendingUp,
    key: 'stock',
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500/10',
  },
  {
    href: '/crypto',
    icon: Bitcoin,
    key: 'crypto',
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/10',
  },
  {
    href: '/kpop',
    icon: Music,
    key: 'kpop',
    gradient: 'from-pink-500 to-rose-600',
    bgGlow: 'bg-pink-500/10',
  },
];

const FEATURE_KEYS = [
  { icon: Sparkles, key: 'aiSentiment' },
  { icon: Shield, key: 'dedup' },
  { icon: BarChart3, key: 'accuracy' },
];

export default function HomeClient() {
  const t = useTranslations('home');
  const tGrade = useTranslations('grade');

  return (
    <div className="relative">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-4 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 mb-6">
              <Sparkles className="h-4 w-4" />
              {t('badge')}
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              {t('title1')}{' '}
              <span className="gradient-text">{t('titleHighlight1')}</span>
              <br />
              {t('title2')}{' '}
              <span className="gradient-text">{t('titleHighlight2')}</span>
            </h1>

            <p className="mt-6 text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl mx-auto">
              {t('subtitle')}
              <br className="hidden sm:inline" />
              <span className="text-grade-big-good font-semibold"> {tGrade('bigGood')}</span> /
              <span className="text-[#2979FF] font-semibold"> {tGrade('good')}</span> /
              <span className="text-[#FF6D00] font-semibold"> {tGrade('bad')}</span> /
              <span className="text-grade-big-bad font-semibold"> {tGrade('bigBad')}</span>
              {t('subtitleSuffix')}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/stock"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition-all duration-200 hover:shadow-brand-600/40"
              >
                {t('ctaPrimary')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-6 py-3 text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 대시보드 카드 섹션 */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {DASHBOARD_KEYS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <Link href={item.href} className="group block">
                  <div className="relative glass-card p-6 hover:border-brand-600/30 transition-all duration-300 overflow-hidden">
                    <div className={`absolute -top-12 -right-12 w-32 h-32 ${item.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t(`dashboards.${item.key}.title`)}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {t(`dashboards.${item.key}.description`)}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('viewMore')} <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t('whyTitle', { appName: 'NovaTrend' })}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {FEATURE_KEYS.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 * i }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10">
                   <Icon className="h-7 w-7 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-base font-semibold mb-2">
                  {t(`features.${feat.key}.title`)}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {t(`features.${feat.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
