'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PenSquare, Send, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/context/ToastContext';
import { CATEGORIES, type PostCategory } from '@/types/community';
import { cn } from '@/lib/utils';

interface WritePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultCategory?: PostCategory;
}

export default function WritePostModal({ isOpen, onClose, onSuccess, defaultCategory }: WritePostModalProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>(defaultCategory || 'free');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast(tCommon('loginRequired'), 'error');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError(t('errorIncomplete'));
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { error: submitError } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          content: content.trim(),
          category,
          author_id: user.id
        });

      if (submitError) throw submitError;

      showToast(t('successWrite'), 'success');
      setTitle('');
      setContent('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Post submission error:', err);
      setError(err.message || tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600">
                  <PenSquare className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold">{t('writePost')}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-xs font-semibold text-red-500 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                  {t('selectCategory')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value as PostCategory)}
                      className={cn(
                        "rounded-xl px-4 py-2 text-xs font-bold transition-all border",
                        category === cat.value
                          ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/20"
                          : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent hover:border-[hsl(var(--border))]"
                      )}
                    >
                      {t(`categories.${cat.value}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                  {t('postTitle')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('titlePlaceholder')}
                  className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm font-medium outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 transition-all placeholder:text-[hsl(var(--muted-foreground)/0.5)]"
                />
              </div>

              {/* Content Textarea */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                  {t('postContent')}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('contentPlaceholder')}
                  rows={8}
                  className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm font-medium outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 transition-all resize-none placeholder:text-[hsl(var(--muted-foreground)/0.5)]"
                />
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-right px-1">
                   {content.length} {t('characters')}
                </p>
              </div>

              {/* Footer / Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-bold hover:bg-[hsl(var(--muted))] transition-all"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t('publishPost')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
