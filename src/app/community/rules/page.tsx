import type { Metadata } from 'next';
import { Shield, AlertTriangle, Ban, FileText, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: '커뮤니티 이용 규칙',
};

const PROHIBITED_ACTIONS = [
  '욕설, 비방, 혐오 발언 및 개인 공격',
  '허위 정보, 가짜 뉴스 유포',
  '투자 권유, 리딩방 홍보, 사기 관련 게시',
  '스팸, 도배, 무의미한 반복 게시',
  '타인의 개인정보 노출 (신상 털기)',
  '저작권 침해 콘텐츠 게시',
  '성적 콘텐츠 또는 불법 콘텐츠',
  '관리자 사칭 또는 시스템 악용',
];

const PENALTIES = [
  { level: '1단계', action: '경고', icon: '⚠️', description: '규칙 위반 시 경고 메시지 발송' },
  { level: '2단계', action: '임시 정지', icon: '⏸️', description: '2회 이상 경고 시 7일간 활동 제한' },
  { level: '3단계', action: '영구 차단', icon: '🚫', description: '심각한 위반 또는 3회 이상 경고 시 영구 이용 차단' },
];

export default function CommunityRulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">커뮤니티 이용 규칙</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            안전하고 건전한 커뮤니티를 위한 규칙
          </p>
        </div>
      </div>

      {/* 금지 행위 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Ban className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold">금지 행위</h2>
        </div>
        <ul className="space-y-2">
          {PROHIBITED_ACTIONS.map((action, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg bg-red-500/5 border border-red-500/10 p-3 text-sm"
            >
              <span className="mt-0.5 text-red-500">✕</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 제재 단계 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">제재 단계</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PENALTIES.map((p) => (
            <div
              key={p.level}
              className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 text-center"
            >
              <span className="text-2xl">{p.icon}</span>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{p.level}</p>
              <p className="text-sm font-semibold mt-1">{p.action}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 면책 조항 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">면책 조항</h2>
        </div>
        <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4 text-sm leading-relaxed space-y-2">
          <p>• NovaTrend에서 제공하는 뉴스 분석은 <strong>AI에 의해 자동 생성</strong>되며, 투자 권유가 아닙니다.</p>
          <p>• 커뮤니티 게시글은 개인의 의견이며, NovaTrend의 공식 입장이 아닙니다.</p>
          <p>• 모든 투자 결정은 <strong>본인 책임</strong>입니다.</p>
          <p>• 뉴스 헤드라인의 저작권은 각 언론사에 있으며, AI 요약은 참고용입니다.</p>
        </div>
      </section>

      {/* 신고 방법 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold">신고 방법</h2>
        </div>
        <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 text-sm leading-relaxed space-y-2">
          <p>1. 게시글/댓글/메시지 우측 상단의 <strong>⚑ 신고 버튼</strong>을 클릭합니다.</p>
          <p>2. 신고 사유를 선택하고, 필요 시 <strong>스크린샷을 첨부</strong>합니다.</p>
          <p>3. 관리팀이 24시간 이내에 검토 후 조치합니다.</p>
          <p className="text-[hsl(var(--muted-foreground))]">
            긴급 사안은 <a href="mailto:report@novatrend.com" className="text-brand-600 hover:underline">report@novatrend.com</a>으로 직접 문의해주세요.
          </p>
        </div>
      </section>
    </div>
  );
}
