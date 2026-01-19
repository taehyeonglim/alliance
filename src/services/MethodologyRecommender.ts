/**
 * 연구방법론 추천 서비스
 * Methodology Recommendation Service
 */

import {
  METHODOLOGY_CATALOG,
  METHODOLOGY_KEYWORDS,
  type MethodologyMetadata,
  type MethodologyRecommendation,
  type ResearchApproach
} from '../core/types/methodology.js';

export interface ResearchInput {
  title: string;
  abstract: string;
  keywords?: string[];
  preferredApproach?: ResearchApproach;
}

export class MethodologyRecommender {
  /**
   * 연구 제목과 요약을 분석하여 적합한 연구방법론 추천
   */
  recommend(input: ResearchInput, topN: number = 5): MethodologyRecommendation[] {
    const combinedText = `${input.title} ${input.abstract} ${(input.keywords || []).join(' ')}`.toLowerCase();

    const recommendations: MethodologyRecommendation[] = [];

    for (const methodology of METHODOLOGY_CATALOG) {
      const { score, matchedKeywords } = this.calculateScore(
        methodology,
        combinedText,
        input.preferredApproach
      );

      if (score > 0) {
        recommendations.push({
          methodology,
          score,
          reasons: this.generateReasons(methodology, matchedKeywords),
          considerations: this.generateConsiderations(methodology, input)
        });
      }
    }

    // 점수 순 정렬 후 상위 N개 반환
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  /**
   * 특정 연구방법론에 대한 점수 계산
   */
  private calculateScore(
    methodology: MethodologyMetadata,
    text: string,
    preferredApproach?: ResearchApproach
  ): { score: number; matchedKeywords: string[] } {
    let score = 0;
    const matchedKeywords: string[] = [];

    // 1. 키워드 매칭 (최대 60점)
    const keywords = METHODOLOGY_KEYWORDS[methodology.id] || [];
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 10;
        matchedKeywords.push(keyword);
      }
    }
    score = Math.min(score, 60);

    // 2. 선호 접근법 일치 (최대 25점)
    if (preferredApproach) {
      if (methodology.approach === preferredApproach) {
        score += 25;
      } else if (methodology.approach === 'mixed-methods') {
        score += 15; // 혼합은 항상 부분 점수
      }
    } else {
      score += 10; // 선호 없으면 기본 점수
    }

    // 3. 복잡도 고려 - 키워드 많이 매칭되면 복잡한 방법도 OK (최대 15점)
    if (matchedKeywords.length >= 3) {
      score += 15;
    } else if (matchedKeywords.length >= 2) {
      score += 10;
    } else if (matchedKeywords.length >= 1) {
      score += 5;
    }

    // 4. 특정 패턴 인식
    // 효과/영향/차이 → 양적 선호
    if (/효과|영향|차이|비교|측정/.test(text) && methodology.category === 'quantitative') {
      score += 10;
    }
    // 경험/인식/의미 → 질적 선호
    if (/경험|인식|의미|이해|탐구|탐색/.test(text) && methodology.category === 'qualitative') {
      score += 10;
    }
    // 개발/구축 → 혼합 또는 실행연구 선호
    if (/개발|구축|설계|모델/.test(text) &&
        (methodology.id === 'action-research' || methodology.category === 'mixed')) {
      score += 10;
    }

    return { score, matchedKeywords };
  }

  /**
   * 추천 이유 생성
   */
  private generateReasons(
    methodology: MethodologyMetadata,
    matchedKeywords: string[]
  ): string[] {
    const reasons: string[] = [];

    if (matchedKeywords.length > 0) {
      reasons.push(`연구 내용에서 '${matchedKeywords.slice(0, 3).join("', '")}' 등의 키워드가 발견되었습니다.`);
    }

    reasons.push(...methodology.suitableFor.slice(0, 2).map(s => `${s}에 적합합니다.`));
    reasons.push(...methodology.strengths.slice(0, 2));

    return reasons;
  }

  /**
   * 고려사항 생성
   */
  private generateConsiderations(
    methodology: MethodologyMetadata,
    _input: ResearchInput
  ): string[] {
    const considerations: string[] = [];

    // 복잡도 관련
    if (methodology.complexity === 'high') {
      considerations.push('높은 연구 복잡도로 충분한 시간과 자원이 필요합니다.');
    }

    // 기간 관련
    considerations.push(`일반적인 연구 기간: ${methodology.typicalDuration}`);

    // 한계점
    considerations.push(...methodology.limitations.slice(0, 2));

    return considerations;
  }

  /**
   * 접근법별 방법론 목록 반환
   */
  getMethodologiesByApproach(approach: ResearchApproach): MethodologyMetadata[] {
    return METHODOLOGY_CATALOG.filter(m => m.approach === approach);
  }

  /**
   * 카테고리별 방법론 목록 반환
   */
  getMethodologiesByCategory(category: 'quantitative' | 'qualitative' | 'mixed'): MethodologyMetadata[] {
    return METHODOLOGY_CATALOG.filter(m => m.category === category);
  }

  /**
   * 전체 방법론 카탈로그 반환
   */
  getAllMethodologies(): MethodologyMetadata[] {
    return [...METHODOLOGY_CATALOG];
  }

  /**
   * ID로 특정 방법론 조회
   */
  getMethodologyById(id: string): MethodologyMetadata | undefined {
    return METHODOLOGY_CATALOG.find(m => m.id === id);
  }
}

// 싱글톤 인스턴스
export const methodologyRecommender = new MethodologyRecommender();
