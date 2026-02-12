'use client';

import { Ticket, ExternalLink, Star } from 'lucide-react';

/**
 * 🎫 K-POP 제휴 배너 컴포넌트
 *
 * 일정 사이드바, 뉴스 카드 하단 등에 삽입되는 제휴 마케팅 배너.
 * 티켓 구매, 굿즈, 음원 스트리밍 등 CPA 기반 수익 모델.
 *
 * 💰 예상 수익: CPA 5~12.5%
 */

interface AffiliateItem {
  id: string;
  type: 'ticket' | 'goods' | 'streaming';
  platform: string;
  title: string;
  description: string;
  url: string;
  commission?: string;
}

// 데모 제휴 데이터
const DEMO_AFFILIATES: AffiliateItem[] = [
  {
    id: '1',
    type: 'ticket',
    platform: 'Interpark Ticket',
    title: '콘서트 티켓 예매',
    description: '최저가 보장 + 좌석 선택',
    url: 'https://ticket.interpark.com',
    commission: 'CPA 8%',
  },
  {
    id: '2',
    type: 'ticket',
    platform: 'Yes24 Ticket',
    title: '팬미팅 & 콘서트',
    description: '선예매 + 할인 혜택',
    url: 'https://ticket.yes24.com',
    commission: 'CPA 5%',
  },
  {
    id: '3',
    type: 'goods',
    platform: 'Weverse Shop',
    title: '공식 굿즈 & 앨범',
    description: '한정판 포토카드 포함',
    url: 'https://weverseshop.io',
    commission: 'CPA 7%',
  },
];

const TYPE_ICONS = {
  ticket: <Ticket className="h-4 w-4" />,
  goods: <Star className="h-4 w-4" />,
  streaming: <Star className="h-4 w-4" />,
};

const TYPE_COLORS = {
  ticket: 'from-pink-500 to-rose-600',
  goods: 'from-purple-500 to-violet-600',
  streaming: 'from-green-500 to-emerald-600',
};

interface AffiliateBannerProps {
  type?: 'ticket' | 'goods' | 'streaming';
  maxItems?: number;
  className?: string;
}

export default function AffiliateBanner({
  type,
  maxItems = 2,
  className = '',
}: AffiliateBannerProps) {
  const items = type
    ? DEMO_AFFILIATES.filter(a => a.type === type).slice(0, maxItems)
    : DEMO_AFFILIATES.slice(0, maxItems);

  if (items.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
        제휴 링크
      </p>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group block rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 hover:bg-[hsl(var(--muted))] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${TYPE_COLORS[item.type]} text-white shrink-0`}>
              {TYPE_ICONS[item.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                {item.platform} · {item.description}
              </p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </a>
      ))}
    </div>
  );
}
