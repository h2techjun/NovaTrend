'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { useParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
] as const;

export default function LocaleSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function onSelectChange(nextLocale: string) {
    startTransition(() => {
      // @ts-ignore
      router.replace(pathname, { locale: nextLocale });
    });
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all",
          isOpen && "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
        )}
        aria-label="언어 선택"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase hidden sm:inline">{locale}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onSelectChange(lang.code)}
                  disabled={isPending}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    locale === lang.code
                      ? "bg-brand-600/10 text-brand-600"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {locale === lang.code && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
