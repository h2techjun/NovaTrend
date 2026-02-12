'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, Eye, Clock, Send, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * 💬 댓글 시스템 컴포넌트
 *
 * 기능:
 * - 댓글 목록 표시 (대댓글 포함)
 * - 댓글 작성 (로그인 필요)
 * - 좋아요 기능 (토글)
 * - 대댓글 접기/펼치기
 */

interface Comment {
  id: number;
  author: {
    username: string;
    avatarUrl?: string;
  };
  content: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: number;
  initialComments?: Comment[];
}

// 데모 댓글 데이터
const DEMO_COMMENTS: Comment[] = [
  {
    id: 1,
    author: { username: 'stock_master' },
    content: '삼성전자 HBM3E 물량 확보 성공했다는 소문 있는데 확인되면 진짜 대박호재죠',
    likes: 12,
    createdAt: '2분 전',
    replies: [
      {
        id: 2,
        author: { username: 'ai_trader' },
        content: '맞습니다. SK하이닉스보다 수율이 좋다는 소문도 있어요',
        likes: 5,
        createdAt: '1분 전',
      },
    ],
  },
  {
    id: 3,
    author: { username: 'crypto_whale' },
    content: '비트코인 12만 돌파하면 알트 시즌 올 듯',
    likes: 8,
    createdAt: '5분 전',
  },
];

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [liked, setLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-[hsl(var(--border))] pl-4' : ''}`}>
      <div className="py-3">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">
            {comment.author.username[0].toUpperCase()}
          </div>
          <span className="text-sm font-semibold">{comment.author.username}</span>
          <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <Clock className="h-3 w-3" />
            {comment.createdAt}
          </span>
        </div>

        {/* 댓글 내용 */}
        <p className="text-sm leading-relaxed mb-2 ml-9">{comment.content}</p>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-4 ml-9">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${
              liked ? 'text-brand-600' : 'text-[hsl(var(--muted-foreground))] hover:text-brand-600'
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {likeCount}
          </button>
          {depth < 2 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-brand-600 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              답글
            </button>
          )}
        </div>

        {/* 답글 입력 */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-9 mt-3"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  className="flex-1 rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
                />
                <button className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 대댓글 */}
      {comment.replies && comment.replies.length > 0 && (
        <>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-xs text-brand-600 mb-2 ml-9"
          >
            {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            답글 {comment.replies.length}개
          </button>
          <AnimatePresence>
            {showReplies && comment.replies.map((reply) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CommentItem comment={reply} depth={depth + 1} />
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default function CommentSection({ initialComments }: CommentSectionProps) {
  const comments = initialComments || DEMO_COMMENTS;
  const [newComment, setNewComment] = useState('');

  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
        <MessageSquare className="h-5 w-5" />
        댓글 {comments.length}개
      </h3>

      {/* 댓글 작성 */}
      <div className="flex gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-sm font-bold shrink-0">
          ?
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요... (로그인 필요)"
            className="flex-1 rounded-xl bg-[hsl(var(--muted))] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-600"
          />
          <button className="flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
            <Send className="h-4 w-4" />
            작성
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="divide-y divide-[hsl(var(--border))]">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
