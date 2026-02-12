'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Bold, Italic, Link as LinkIcon, Image, Hash } from 'lucide-react';

/**
 * ✍️ 게시글 작성 페이지
 *
 * 기능:
 * - 카테고리 선택 (주식/크립토/K-POP/자유)
 * - 제목 + 본문 (마크다운 지원 예정)
 * - 태그 추가
 * - 작성 취소 / 제출
 */

const CATEGORIES = [
  { value: 'stock', label: '주식', emoji: '📈' },
  { value: 'crypto', label: '크립토', emoji: '💰' },
  { value: 'kpop', label: 'K-POP', emoji: '🎤' },
  { value: 'free', label: '자유', emoji: '💬' },
];

export default function WritePostPage() {
  const router = useRouter();
  const [category, setCategory] = useState('free');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    // TODO: Supabase에 게시글 저장
    // await supabase.from('posts').insert({ ... })
    router.push('/community');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </button>
        <h1 className="text-2xl font-bold">새 글 작성</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 카테고리 선택 */}
        <div>
          <label className="text-sm font-semibold mb-2 block">카테고리</label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  category === cat.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="text-sm font-semibold mb-2 block">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={200}
            className="w-full rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-base outline-none focus:ring-2 focus:ring-brand-600"
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 text-right">{title.length}/200</p>
        </div>

        {/* 본문 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold">본문</label>
            <div className="flex gap-1">
              {[Bold, Italic, LinkIcon, Image].map((Icon, i) => (
                <button
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요...&#10;&#10;⚠️ 투자 조언이 아닌 개인적인 견해를 공유해주세요.&#10;⚠️ 허위 정보 유포 시 제재를 받을 수 있습니다."
            rows={12}
            className="w-full rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-brand-600 resize-none"
          />
        </div>

        {/* 태그 */}
        <div>
          <label className="text-sm font-semibold mb-2 block">태그 (최대 5개)</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-lg bg-brand-600/10 text-brand-600 px-2.5 py-1 text-xs font-medium"
              >
                <Hash className="h-3 w-3" />
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
          {tags.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="태그 입력 후 Enter"
                className="flex-1 rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
              />
              <button
                onClick={handleAddTag}
                className="rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm hover:bg-brand-600 hover:text-white transition-colors"
              >
                추가
              </button>
            </div>
          )}
        </div>

        {/* 면책 조항 */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-600 dark:text-amber-400">
          <p className="font-semibold mb-1">⚠️ 작성 시 유의사항</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>투자에 대한 최종 판단은 사용자 본인의 책임입니다</li>
            <li>허위 정보, 욕설, 스팸은 즉시 제재됩니다</li>
            <li>타인의 저작권을 침해하지 마세요</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => router.back()}
            className="rounded-xl px-6 py-3 text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            게시하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
