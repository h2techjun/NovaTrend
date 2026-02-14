'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, PlusCircle, X, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

interface Subscription {
  id: number;
  keyword: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: 'stock', label: '📈 주식', color: 'from-blue-500 to-cyan-500' },
  { value: 'crypto', label: '₿ 크립토', color: 'from-orange-500 to-yellow-500' },
  { value: 'kpop', label: '🎵 K-POP', color: 'from-pink-500 to-purple-500' },
];

export default function KeywordSubscription() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('stock');
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const supabase = createClient();

  // 구독 목록 로드
  const fetchSubs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('keyword_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setSubs(data as Subscription[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  // 키워드 추가
  const addKeyword = async () => {
    if (!user || !newKeyword.trim()) return;

    // 중복 검사
    const exists = subs.some(
      (s) => s.keyword.toLowerCase() === newKeyword.trim().toLowerCase() && s.category === newCategory
    );
    if (exists) {
      showToast('이미 등록된 키워드입니다.');
      return;
    }

    setAdding(true);
    const { error } = await supabase.from('keyword_subscriptions').insert({
      user_id: user.id,
      keyword: newKeyword.trim(),
      category: newCategory,
      is_active: true,
    });

    if (error) {
      showToast('키워드 등록에 실패했습니다.');
    } else {
      showToast('키워드가 등록되었습니다!');
      setNewKeyword('');
      fetchSubs();
    }
    setAdding(false);
  };

  // 활성 토글
  const toggleActive = async (id: number, currentState: boolean) => {
    const { error } = await supabase
      .from('keyword_subscriptions')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (!error) {
      setSubs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !currentState } : s))
      );
    }
  };

  // 삭제
  const deleteSub = async (id: number) => {
    const { error } = await supabase
      .from('keyword_subscriptions')
      .delete()
      .eq('id', id);

    if (!error) {
      setSubs((prev) => prev.filter((s) => s.id !== id));
      showToast('키워드가 삭제되었습니다.');
    }
  };

  // 토스트 알림
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 로그인 상태 확인
  if (!user) {
    return (
      <div className="glass-card p-6 text-center">
        <BellOff className="h-8 w-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          로그인하면 관심 키워드 알림을 설정할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-yellow-500" />
        <h3 className="text-base font-semibold">키워드 알림</h3>
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
          {subs.filter((s) => s.is_active).length}개 활성
        </span>
      </div>

      {/* 키워드 추가 폼 */}
      <div className="flex gap-2 mb-4">
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-transparent px-2 py-1.5 text-sm focus:ring-2 focus:ring-yellow-500/50"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
          placeholder="키워드 입력..."
          maxLength={30}
          className="flex-1 min-w-0 rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-1.5 text-sm focus:ring-2 focus:ring-yellow-500/50 placeholder:text-[hsl(var(--muted-foreground))]"
        />
        <button
          onClick={addKeyword}
          disabled={adding || !newKeyword.trim()}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
          추가
        </button>
      </div>

      {/* 구독 목록 */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : subs.length === 0 ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">
          등록된 키워드가 없습니다. 관심 키워드를 추가해보세요!
        </p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <AnimatePresence>
            {subs.map((sub) => {
              const catInfo = CATEGORIES.find((c) => c.value === sub.category);
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3 py-2"
                >
                  {/* 카테고리 뱃지 */}
                  <span
                    className={`shrink-0 rounded-full bg-gradient-to-r ${catInfo?.color || 'from-gray-400 to-gray-500'} px-2 py-0.5 text-[10px] font-medium text-white`}
                  >
                    {catInfo?.label || sub.category}
                  </span>

                  {/* 키워드 */}
                  <span className={`flex-1 text-sm font-medium ${!sub.is_active ? 'line-through opacity-50' : ''}`}>
                    {sub.keyword}
                  </span>

                  {/* 활성/비활성 토글 */}
                  <button
                    onClick={() => toggleActive(sub.id, sub.is_active)}
                    className={`p-1 rounded hover:bg-[hsl(var(--muted))] transition-colors ${sub.is_active ? 'text-yellow-500' : 'text-[hsl(var(--muted-foreground))]'}`}
                    title={sub.is_active ? '알림 끄기' : '알림 켜기'}
                  >
                    {sub.is_active ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </button>

                  {/* 삭제 */}
                  <button
                    onClick={() => deleteSub(sub.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors"
                    title="삭제"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 토스트 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
