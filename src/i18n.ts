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

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
