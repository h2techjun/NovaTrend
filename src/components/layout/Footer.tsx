import Link from 'next/link';
import { TrendingUp, Bitcoin, Music, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white">
                NT
              </div>
              <span className="font-bold text-lg">NovaTrend</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              AI 기반 글로벌 뉴스 감성 분석 대시보드
            </p>
          </div>

          {/* 대시보드 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">대시보드</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/stock" className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  <TrendingUp className="h-3.5 w-3.5" /> 글로벌 주식
                </Link>
              </li>
              <li>
                <Link href="/crypto" className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  <Bitcoin className="h-3.5 w-3.5" /> 크립토
                </Link>
              </li>
              <li>
                <Link href="/kpop" className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  <Music className="h-3.5 w-3.5" /> K-POP
                </Link>
              </li>
            </ul>
          </div>

          {/* 커뮤니티 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">커뮤니티</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/community" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  게시판
                </Link>
              </li>
              <li>
                <Link href="/community/rules" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  이용 규칙
                </Link>
              </li>
            </ul>
          </div>

          {/* 번역 서비스 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">파트너</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://doctranslation.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> DocTranslation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 면책 조항 */}
        <div className="mt-8 border-t border-[hsl(var(--border))] pt-6">
          <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            ⚠️ 면책 조항: 본 사이트의 뉴스 분석은 AI에 의해 자동 생성되며, 투자 권유가 아닙니다. 
            투자 판단은 본인 책임입니다. 뉴스 헤드라인의 저작권은 각 언론사에 있으며, AI 요약은 참고용입니다.
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
            © {new Date().getFullYear()} NovaTrend. Powered by DocTranslation.
          </p>
        </div>
      </div>
    </footer>
  );
}
