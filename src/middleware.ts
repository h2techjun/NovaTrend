import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  // 기본 언어(ko)는 URL에 접두사 없이 사용
  localePrefix: 'as-needed',
});

export const config = {
  // 국제화가 필요하지 않은 경로 제외
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
