'use client';

import { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Globe, ArrowRight, Crown } from 'lucide-react';

/**
 * 📢 Ezoic 호환 광고 배너 + 자체 프로모션 폴백 (DocTranslation 패턴)
 *
 * 1. Ezoic 플레이스홀더 div 렌더링
 * 2. Ezoic이 광고를 삽입하지 않으면 SelfPromoBanner 폴백 표시
 * 3. 모든 플레이스홀더를 EzoicAdsProvider에서 수집 → 단일 showAds() 호출
 */

// 광고 슬롯 타입
export type AdSlot = 'top' | 'middle' | 'bottom' | 'sidebar' | 'infeed';

// Ezoic 플레이스홀더 ID 매핑 (Ezoic 대시보드에서 설정)
export const EZOIC_PLACEHOLDER_IDS: Record<AdSlot, number> = {
  top: 201,
  middle: 202,
  bottom: 203,
  sidebar: 204,
  infeed: 205,
};

// ──────────────────────────────────────────
// EzoicAdsProvider — 페이지 내 모든 플레이스홀더 수집
// ──────────────────────────────────────────

interface EzoicAdsContextType {
  registerPlaceholder: (id: number) => void;
  unregisterPlaceholder: (id: number) => void;
}

const EzoicAdsContext = createContext<EzoicAdsContextType | null>(null);

export function EzoicAdsProvider({ children }: { children: React.ReactNode }) {
  const placeholderIds = useRef<Set<number>>(new Set());
  const showAdsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerShowAds = useCallback(() => {
    if (showAdsTimer.current) clearTimeout(showAdsTimer.current);

    showAdsTimer.current = setTimeout(() => {
      if (typeof window === 'undefined') return;
      const ezstandalone = (window as unknown as { ezstandalone?: { cmd?: Array<() => void>; showAds?: (ids: number[]) => void } }).ezstandalone;
      if (!ezstandalone?.cmd) return;

      const ids = Array.from(placeholderIds.current);
      if (ids.length === 0) return;

      ezstandalone.cmd.push(function () {
        ezstandalone.showAds?.(ids);
      });
    }, 100);
  }, []);

  const registerPlaceholder = useCallback((id: number) => {
    placeholderIds.current.add(id);
    triggerShowAds();
  }, [triggerShowAds]);

  const unregisterPlaceholder = useCallback((id: number) => {
    placeholderIds.current.delete(id);
  }, []);

  return (
    <EzoicAdsContext.Provider value={{ registerPlaceholder, unregisterPlaceholder }}>
      {children}
    </EzoicAdsContext.Provider>
  );
}

// ──────────────────────────────────────────
// 자체 프로모션 배너 데이터 (Ezoic 미승인 시 폴백)
// ──────────────────────────────────────────

interface PromoBanner {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  href: string;
  gradient: string;
  iconBg: string;
}

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'doctranslation',
    icon: <Globe className="h-5 w-5" />,
    title: '문서 번역이 필요하세요?',
    description: 'AI 기반 문서 번역 서비스 DocTranslation으로 30+ 언어 지원',
    cta: '무료로 시작하기',
    href: 'https://doctranslation.com',
    gradient: 'from-blue-600 to-indigo-600',
    iconBg: 'bg-blue-500/20',
  },
  {
    id: 'novatrend-pro',
    icon: <Crown className="h-5 w-5" />,
    title: '광고 없이 보기',
    description: 'NovaTrend Pro로 광고 없는 깔끔한 뉴스 분석을 경험하세요',
    cta: 'Pro 업그레이드',
    href: '/pricing',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/20',
  },
  {
    id: 'novatrend-community',
    icon: <Sparkles className="h-5 w-5" />,
    title: '투자 인사이트를 공유하세요',
    description: 'NovaTrend 커뮤니티에서 다른 투자자들과 뉴스 분석 토론',
    cta: '커뮤니티 참여',
    href: '/community',
    gradient: 'from-brand-500 to-brand-700',
    iconBg: 'bg-brand-500/20',
  },
];

function SelfPromoBanner({ slot }: { slot: AdSlot }) {
  const banner = PROMO_BANNERS[Math.floor(Math.random() * PROMO_BANNERS.length)];
  const isVertical = slot === 'sidebar';

  return (
    <Link
      href={banner.href}
      target={banner.href.startsWith('http') ? '_blank' : undefined}
      rel={banner.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={`block rounded-xl bg-gradient-to-r ${banner.gradient} p-4 text-white transition-all hover:shadow-lg hover:scale-[1.01] ${isVertical ? 'text-center' : ''}`}
    >
      <div className={`flex ${isVertical ? 'flex-col items-center gap-3' : 'items-center gap-4'}`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${banner.iconBg}`}>
          {banner.icon}
        </div>
        <div className={isVertical ? 'text-center' : ''}>
          <p className="text-sm font-semibold">{banner.title}</p>
          <p className="text-xs opacity-80 mt-0.5">{banner.description}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold ${isVertical ? 'mt-2' : 'ml-auto shrink-0'}`}>
          {banner.cta} <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

// ──────────────────────────────────────────
// 메인 컴포넌트: AdBanner
// ──────────────────────────────────────────

interface AdBannerProps {
  /** 광고 위치 (Ezoic 플레이스홀더 ID 매핑) */
  slot?: AdSlot;
  className?: string;
}

export default function AdBanner({ slot = 'middle', className = '' }: AdBannerProps) {
  const [ezoicActive, setEzoicActive] = useState(false);
  const placeholderId = EZOIC_PLACEHOLDER_IDS[slot];
  const context = useContext(EzoicAdsContext);

  // EzoicAdsProvider에 플레이스홀더 등록
  useEffect(() => {
    context?.registerPlaceholder(placeholderId);
    return () => {
      context?.unregisterPlaceholder(placeholderId);
    };
  }, [context, placeholderId]);

  // Ezoic이 플레이스홀더에 광고를 삽입했는지 감시
  useEffect(() => {
    const checkEzoicFilled = () => {
      const el = document.getElementById(`ezoic-pub-ad-placeholder-${placeholderId}`);
      if (el && el.children.length > 0) {
        setEzoicActive(true);
        return true;
      }
      return false;
    };

    // Ezoic이 광고를 삽입할 때까지 주기적으로 확인
    const interval = setInterval(() => {
      if (checkEzoicFilled()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [placeholderId]);

  return (
    <div className={`${className} my-4`} data-ad-slot={slot}>
      {/* Ezoic 플레이스홀더 — 스타일 없이 순수 div */}
      <div id={`ezoic-pub-ad-placeholder-${placeholderId}`} />

      {/* Ezoic이 광고를 삽입하지 않은 경우 자체 프로모션 표시 */}
      {!ezoicActive && (
        <SelfPromoBanner slot={slot} />
      )}
    </div>
  );
}
