'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Flag,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Comment } from '@/types/community';

interface CommentSectionProps {
  postId: number;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

  const supabase = createClient();

  // 댓글 조회 (트리 구조)
  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)')
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (!error && data) {
      // 트리 구조로 변환
      const rootComments: Comment[] = [];
      const replyMap: Record<number, Comment[]> = {};

      data.forEach((comment: Comment) => {
        if (comment.parent_id === null) {
          rootComments.push({ ...comment, replies: [] });
        } else {
          if (!replyMap[comment.parent_id]) {
            replyMap[comment.parent_id] = [];
          }
          replyMap[comment.parent_id].push(comment);
        }
      });

      rootComments.forEach((comment) => {
        comment.replies = replyMap[comment.id] || [];
      });

      setComments(rootComments);
    }

    setLoading(false);
  }, [postId, supabase]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content: newComment.trim(),
      parent_id: null,
    });

    setNewComment('');
    setSubmitting(false);
    await fetchComments();
  };

  // 답글 작성
  const handleSubmitReply = async (parentId: number) => {
    if (!user || !replyContent.trim()) return;

    setSubmitting(true);
    await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content: replyContent.trim(),
      parent_id: parentId,
    });

    setReplyTo(null);
    setReplyContent('');
    setSubmitting(false);
    setExpandedReplies((prev) => new Set(prev).add(parentId));
    await fetchComments();
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-6"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-bold">댓글 {totalCount > 0 && `(${totalCount})`}</h2>
      </div>

      {/* 댓글 입력 */}
      {user ? (
        <div className="flex gap-3 mb-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-xs font-bold text-brand-600 mt-1">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 남겨보세요..."
              rows={3}
              className="w-full rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                댓글 등록
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] rounded-xl py-4 mb-6">
          댓글을 남기려면 로그인해주세요.
        </p>
      )}

      {/* 로딩 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id}>
              {/* 댓글 */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-bold mt-0.5">
                  {comment.author?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {comment.author?.display_name || comment.author?.username || '익명'}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm mb-2 whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                    {user && (
                      <button
                        onClick={() => { setReplyTo(replyTo === comment.id ? null : comment.id); setReplyContent(''); }}
                        className="hover:text-brand-600 transition-colors"
                      >
                        답글
                      </button>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center gap-0.5 hover:text-brand-600 transition-colors"
                      >
                        {expandedReplies.has(comment.id) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        답글 {comment.replies.length}개
                      </button>
                    )}
                  </div>

                  {/* 답글 입력 */}
                  {replyTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 입력하세요..."
                        className="flex-1 rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitReply(comment.id); }}}
                      />
                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim() || submitting}
                        className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* 답글 목록 */}
                  {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-[hsl(var(--border))]">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[10px] font-bold mt-0.5">
                            {reply.author?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold">
                                {reply.author?.display_name || reply.author?.username || '익명'}
                              </span>
                              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                                {formatTimeAgo(reply.created_at)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
