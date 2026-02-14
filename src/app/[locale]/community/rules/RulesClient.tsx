'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield, AlertTriangle, Ban, FileText, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RulesClient() {
  const t = useTranslations('rules');

  const PENALTIES = [
    { key: 'v1', icon: '⚠️', color: 'text-amber-500' },
    { key: 'v2', icon: '⏸️', color: 'text-orange-500' },
    { key: 'v3', icon: '🚫', color: 'text-red-500' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-12"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/20">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t('title')}</h1>
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            {t('subtitle')}
          </p>
        </div>
      </motion.div>

      {/* Prohibited Actions */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Ban className="h-6 w-6 text-red-500" />
          <h2 className="text-xl font-black">{t('prohibited.title')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* @ts-ignore */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group flex items-center gap-4 rounded-2xl bg-red-500/5 border border-red-500/10 p-4 transition-all hover:bg-red-500/10 hover:border-red-500/20"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-red-950 text-red-500 font-bold text-xs shadow-sm">
                {i + 1}
              </div>
              <span className="text-sm font-semibold">{t(`prohibited.items.${i}`)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Penalties */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-black">{t('penalties.title')}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PENALTIES.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="relative rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center space-y-3 group hover:border-brand-500/50 transition-all shadow-sm"
            >
              <span className="text-4xl block group-hover:scale-110 transition-transform">{p.icon}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{t(`penalties.${p.key}.level`)}</p>
              <p className={cn("text-lg font-black", p.color)}>{t(`penalties.${p.key}.action`)}</p>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">{t(`penalties.${p.key}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-brand-600" />
          <h2 className="text-xl font-black">{t('disclaimer.title')}</h2>
        </div>
        <div className="rounded-3xl bg-brand-600/5 border border-brand-600/10 p-8 space-y-4 shadow-inner">
          {[1, 2, 3, 4].map((i) => (
            <p key={i} className="text-sm font-medium leading-relaxed flex items-start gap-3">
              <span className="text-brand-600 font-black">•</span>
              <span dangerouslySetInnerHTML={{ __html: t(`disclaimer.item${i}`).replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-600">$1</strong>') }} />
            </p>
          ))}
        </div>
      </section>

      {/* Report */}
      <section className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-black">{t('report.title')}</h2>
        </div>
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 space-y-6 shadow-xl shadow-black/5">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <p key={i} className="text-sm font-semibold leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: t(`report.step${i}`).replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-600">$1</strong>') }} 
              />
            ))}
          </div>
          <div className="pt-4 border-t border-[hsl(var(--border))]">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              {/* @ts-ignore */}
              {t.rich('report.urgent', {
                email: (chunks: any) => <a href="mailto:report@novatrend.com" className="text-brand-600 hover:underline font-bold">report@novatrend.com</a>
              })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
