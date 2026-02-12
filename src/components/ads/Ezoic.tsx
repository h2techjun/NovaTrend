'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { EzoicAdsProvider } from './AdBanner';

/**
 * 🚀 Ezoic 광고 플랫폼 통합 (DocTranslation 동일 패턴)
 *
 * 1. 개인정보 보호 스크립트 (Gatekeeper Consent CMP)
 * 2. Ezoic 메인 헤더 스크립트 (sa.min.js)
 * 3. ezstandalone 초기화 및 SPA 네비게이션 처리
 * 4. EzoicAdsProvider로 모든 플레이스홀더 수집 → 단일 showAds() 호출
 * 5. Google Analytics (GA4) — 별도 속성
 */

// Google Analytics ID (NovaTrend 전용)
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// 광고를 표시하지 않을 페이지 경로
const AD_EXCLUDED_PATHS = [
  '/auth',
  '/signin',
  '/signup',
  '/settings',
  '/report',
  '/community/rules',
];

export default function Ezoic({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();

  // SPA 네비게이션 시 Ezoic에 페이지 변경 알림
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ezstandalone = (window as unknown as { ezstandalone?: { cmd?: Array<() => void>; destroy?: () => void; define?: () => void; enable?: () => void; display?: () => void } }).ezstandalone;
    if (!ezstandalone?.cmd) return;

    const isExcluded = AD_EXCLUDED_PATHS.some(p => pathname.startsWith(p));

    if (isExcluded) {
      ezstandalone.cmd.push(function () {
        ezstandalone.destroy?.();
      });
    } else {
      ezstandalone.cmd.push(function () {
        ezstandalone.define?.();
        ezstandalone.enable?.();
        ezstandalone.display?.();
      });
    }
  }, [pathname]);

  return (
    <>
      {/* 1. Ezoic 개인정보 보호 스크립트 (Gatekeeper Consent CMP) */}
      <Script
        src="https://cmp.gatekeeperconsent.com/min.js"
        strategy="beforeInteractive"
        data-cfasync="false"
      />
      <Script
        src="https://the.gatekeeperconsent.com/cmp.min.js"
        strategy="beforeInteractive"
        data-cfasync="false"
      />

      {/* 2. Ezoic 메인 헤더 스크립트 */}
      <Script
        src="//www.ezojs.com/ezoic/sa.min.js"
        strategy="afterInteractive"
      />

      {/* 3. ezstandalone 전역 객체 초기화 */}
      <Script id="ezoic-init" strategy="afterInteractive">
        {`
          window.ezstandalone = window.ezstandalone || {};
          ezstandalone.cmd = ezstandalone.cmd || [];
        `}
      </Script>

      {/* 4. Google Analytics (NovaTrend 전용 속성) */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {/* 5. EzoicAdsProvider — 플레이스홀더 수집 및 단일 showAds() 호출 */}
      <EzoicAdsProvider>
        {children}
      </EzoicAdsProvider>
    </>
  );
}
