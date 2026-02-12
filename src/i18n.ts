import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// 지원 언어 목록
export const locales = ['ko', 'en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ko';

// 언어별 표시명
export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
};

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale as string;
  if (!locales.includes(currentLocale as Locale)) notFound();

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default,
  };
});
