'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Megaphone } from 'lucide-react';

/**
 * 📢 네이티브 광고 컴포넌트
 *
 * 뉴스 피드 사이에 자연스럽게 삽입되는 광고.
 * NewsCard와 동일한 디자인이지만 "광고" 레이블을 명시하여
 * 사용자가 광고임을 명확히 인식할 수 있도록 합니다.
 */

interface NativeAdProps {
  title: string;
  description: string;
  advertiser: string;
  imageUrl?: string;
  targetUrl: string;
  index?: number;
}

export default function NativeAd({
  title,
  description,
  advertiser,
  targetUrl,
  index = 0,
}: NativeAdProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative rounded-xl bg-[hsl(var(--card))] p-4 border border-dashed border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
    >
      {/* 광고 레이블 — 반드시 표시 */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          <Megaphone className="h-3 w-3" />
          광고
        </span>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
          {advertiser}
        </span>
      </div>

      {/* 광고 콘텐츠 */}
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        <h3 className="text-sm font-semibold leading-snug mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400">
          자세히 보기 <ExternalLink className="h-3 w-3" />
        </span>
      </a>
    </motion.div>
  );
}
