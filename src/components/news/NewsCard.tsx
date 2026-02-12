'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';
import { cn, type SentimentGrade, GRADE_LABELS, GRADE_COLORS, GRADE_CLASSES, formatDate } from '@/lib/utils';

interface NewsCardProps {
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  grade: SentimentGrade;
  confidence: number;
  index?: number;
}

export default function NewsCard({
  title,
  summary,
  sourceUrl,
  sourceName,
  publishedAt,
  grade,
  confidence,
  index = 0,
}: NewsCardProps) {
  const gradeLabel = GRADE_LABELS[grade];
  const gradeColor = GRADE_COLORS[grade];
  const gradeClass = GRADE_CLASSES[grade];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'group relative rounded-xl bg-[hsl(var(--card))] p-4 transition-all duration-200',
        'hover:bg-[hsl(var(--muted))] hover:shadow-lg',
        gradeClass
      )}
    >
      {/* 등급 뱃지 */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold"
          style={{
            backgroundColor: `${gradeColor}15`,
            color: gradeColor,
          }}
        >
          {gradeLabel.ko}
        </span>
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <span>정확도 {Math.round(confidence * 100)}%</span>
        </div>
      </div>

      {/* 제목 */}
      <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {title}
      </h3>

      {/* AI 요약 */}
      <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3 line-clamp-2">
        {summary}
      </p>

      {/* 메타 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <span className="font-medium">{sourceName}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(publishedAt)}
          </span>
        </div>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="원문 보기"
        >
          원문 <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </motion.article>
  );
}
