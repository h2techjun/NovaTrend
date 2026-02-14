/**
 * 커뮤니티 공용 타입 정의
 * Supabase 테이블 스키마와 1:1 매칭
 */

// === 프로필 ===
export interface Profile {
  id: string; // auth.users.id (UUID)
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro" | "team";
  points: number;
  bio: string | null;
  locale: string;
  created_at: string;
  updated_at: string;
}

// === 게시글 ===
export interface Post {
  id: number;
  author_id: string;
  category: "stock" | "crypto" | "kpop" | "free";
  title: string;
  content: string;
  views: number;
  likes: number;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // 조인 필드
  author?: Pick<
    Profile,
    "id" | "username" | "display_name" | "avatar_url" | "plan"
  >;
}

// === 댓글 ===
export interface Comment {
  id: number;
  post_id: number;
  author_id: string;
  parent_id: number | null;
  content: string;
  likes: number;
  is_deleted: boolean;
  created_at: string;
  // 조인 필드
  author?: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  replies?: Comment[];
}

// === 좋아요 ===
export interface Like {
  id: number;
  user_id: string;
  target_type: "post" | "comment";
  target_id: number;
  created_at: string;
}

// === 쪽지 ===
export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // 조인 필드
  sender?: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  receiver?: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
}

// === 신고 ===
export type ReportTargetType = "post" | "comment" | "user" | "message";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface Report {
  id: number;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: number;
  reason: string;
  description: string | null;
  screenshot_url: string | null;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
}

// === 제재 ===
export type SanctionLevel = "warning" | "temp_ban" | "permanent_ban";

export interface Sanction {
  id: number;
  user_id: string;
  level: SanctionLevel;
  reason: string;
  expires_at: string | null;
  created_at: string;
}

// === 페이지네이션 ===
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// === 카테고리 ===
export type PostCategory = Post["category"];

export const CATEGORIES = [
  { value: "all" as const, label: "전체", emoji: "📋" },
  { value: "stock" as const, label: "주식", emoji: "📈" },
  { value: "crypto" as const, label: "크립토", emoji: "💰" },
  { value: "kpop" as const, label: "K-POP", emoji: "🎤" },
  { value: "free" as const, label: "자유", emoji: "💬" },
] as const;

export const CATEGORY_BADGE: Record<
  PostCategory,
  { label: string; bg: string; text: string }
> = {
  stock: {
    label: "주식",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  crypto: {
    label: "크립토",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  kpop: {
    label: "K-POP",
    bg: "bg-pink-500/10",
    text: "text-pink-600 dark:text-pink-400",
  },
  free: {
    label: "자유",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
};
