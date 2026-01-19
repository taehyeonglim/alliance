/**
 * 연구방법론 데이터 (대시보드용)
 */

export type ResearchApproach = 'quantitative' | 'qualitative' | 'mixed-methods';
export type MethodologyCategory = 'quantitative' | 'qualitative' | 'mixed';

export interface MethodologyMetadata {
  id: string;
  name: {
    en: string;
    ko: string;
  };
  description: {
    en: string;
    ko: string;
  };
  approach: ResearchApproach;
  category: MethodologyCategory;
  suitableFor: string[];
  strengths: string[];
  limitations: string[];
  typicalDuration: string;
  complexity: 'low' | 'medium' | 'high';
}

export interface MethodologyRecommendation {
  methodology: MethodologyMetadata;
  score: number;
  reasons: string[];
  considerations: string[];
}

// 연구방법론 카탈로그
export const METHODOLOGY_CATALOG: MethodologyMetadata[] = [
  // ===== 양적 연구 방법 =====
  {
    id: 'experimental',
    name: { en: 'Experimental Research', ko: '실험 연구' },
    description: {
      en: 'Manipulates independent variables to observe effects on dependent variables with random assignment',
      ko: '독립변수를 조작하여 종속변수에 미치는 영향을 무작위 배정으로 관찰'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['인과관계 검증', '가설 검정', '효과 측정', '의약품/치료법 효과'],
    strengths: ['높은 내적 타당도', '인과관계 추론 가능', '반복 검증 가능'],
    limitations: ['높은 통제 필요', '외적 타당도 제한', '윤리적 제약'],
    typicalDuration: '3-12개월',
    complexity: 'high'
  },
  {
    id: 'quasi-experimental',
    name: { en: 'Quasi-Experimental Research', ko: '준실험 연구' },
    description: {
      en: 'Similar to experiments but without random assignment',
      ko: '실험과 유사하나 무작위 배정 없이 수행'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['정책 효과 평가', '교육 프로그램 평가', '현장 연구'],
    strengths: ['현실적 적용 가능', '윤리적 제약 적음', '외적 타당도 높음'],
    limitations: ['선택 편향 가능', '내적 타당도 제한'],
    typicalDuration: '3-12개월',
    complexity: 'medium'
  },
  {
    id: 'survey',
    name: { en: 'Survey Research', ko: '설문조사 연구' },
    description: {
      en: 'Collects data from a sample through questionnaires',
      ko: '설문지를 통해 표본에서 데이터를 수집'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['태도/의견 조사', '인구 특성 파악', '트렌드 분석', '대규모 데이터 수집'],
    strengths: ['대규모 표본 가능', '일반화 용이', '비용 효율적'],
    limitations: ['응답 편향', '깊이 있는 이해 제한', '인과관계 추론 어려움'],
    typicalDuration: '1-6개월',
    complexity: 'low'
  },
  {
    id: 'correlational',
    name: { en: 'Correlational Research', ko: '상관 연구' },
    description: {
      en: 'Examines relationships between variables without manipulation',
      ko: '변수 조작 없이 변수 간 관계를 검토'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['변수 간 관계 탐색', '예측 모델 개발', '초기 탐색 연구'],
    strengths: ['자연스러운 환경', '다수 변수 동시 분석', '예측 가능'],
    limitations: ['인과관계 추론 불가', '제3변수 문제'],
    typicalDuration: '2-6개월',
    complexity: 'low'
  },
  {
    id: 'longitudinal',
    name: { en: 'Longitudinal Study', ko: '종단 연구' },
    description: {
      en: 'Follows same subjects over extended period',
      ko: '동일 대상을 장기간 추적하여 변화 관찰'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['발달 연구', '변화 추적', '장기 효과 측정', '코호트 연구'],
    strengths: ['변화 패턴 파악', '인과관계 추론 강화', '개인 내 변화 측정'],
    limitations: ['시간/비용 소요', '대상자 이탈', '역사 효과'],
    typicalDuration: '1-10년',
    complexity: 'high'
  },
  {
    id: 'meta-analysis',
    name: { en: 'Meta-Analysis', ko: '메타분석' },
    description: {
      en: 'Statistical synthesis of results from multiple studies',
      ko: '여러 연구 결과의 통계적 종합'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['기존 연구 종합', '효과 크기 추정', '일반화 검증'],
    strengths: ['높은 통계적 검정력', '일반화 가능', '연구 간 비교'],
    limitations: ['출판 편향', '연구 이질성', '원자료 접근 제한'],
    typicalDuration: '3-12개월',
    complexity: 'high'
  },

  // ===== 질적 연구 방법 =====
  {
    id: 'phenomenology',
    name: { en: 'Phenomenological Research', ko: '현상학적 연구' },
    description: {
      en: 'Explores lived experiences to understand the essence of a phenomenon',
      ko: '체험을 탐구하여 현상의 본질을 이해'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['주관적 경험 이해', '의미 탐구', '새로운 현상 탐색'],
    strengths: ['깊은 이해', '참여자 관점 중시', '풍부한 기술'],
    limitations: ['일반화 어려움', '연구자 주관 개입', '시간 소요'],
    typicalDuration: '6-18개월',
    complexity: 'high'
  },
  {
    id: 'grounded-theory',
    name: { en: 'Grounded Theory', ko: '근거이론' },
    description: {
      en: 'Develops theory grounded in collected data',
      ko: '수집된 데이터에 기반하여 이론 개발'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['새로운 이론 개발', '과정/상호작용 이해', '기존 이론 부재 영역'],
    strengths: ['이론 생성', '데이터 기반', '체계적 절차'],
    limitations: ['시간 집약적', '복잡한 분석', '이론 포화 판단 어려움'],
    typicalDuration: '12-24개월',
    complexity: 'high'
  },
  {
    id: 'case-study',
    name: { en: 'Case Study', ko: '사례연구' },
    description: {
      en: 'In-depth investigation of a case in real-life context',
      ko: '실제 맥락에서 사례에 대한 심층 조사'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['복잡한 현상 이해', '맥락적 분석', '독특한 사례', '정책/프로그램 평가'],
    strengths: ['풍부한 세부사항', '맥락 이해', '다양한 자료원'],
    limitations: ['일반화 제한', '연구자 편향', '경계 설정 어려움'],
    typicalDuration: '3-12개월',
    complexity: 'medium'
  },
  {
    id: 'ethnography',
    name: { en: 'Ethnography', ko: '민족지학/문화기술지' },
    description: {
      en: 'Studies culture through prolonged immersion',
      ko: '장기간 몰입을 통해 문화 연구'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['문화 이해', '집단 행동 연구', '조직 문화', '온라인 커뮤니티'],
    strengths: ['심층적 문화 이해', '자연스러운 환경', '전체론적 관점'],
    limitations: ['매우 시간 집약적', '연구자 영향', '접근성 제한'],
    typicalDuration: '12-36개월',
    complexity: 'high'
  },
  {
    id: 'narrative',
    name: { en: 'Narrative Research', ko: '내러티브 연구' },
    description: {
      en: 'Explores individual stories through narrative analysis',
      ko: '내러티브 분석을 통해 개인의 이야기 탐구'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['개인 경험 이해', '정체성 연구', '생애사', '사회적 맥락 분석'],
    strengths: ['개인 목소리 존중', '시간적 맥락', '풍부한 서술'],
    limitations: ['주관성', '일반화 제한', '해석 다양성'],
    typicalDuration: '6-18개월',
    complexity: 'medium'
  },
  {
    id: 'action-research',
    name: { en: 'Action Research', ko: '실행연구' },
    description: {
      en: 'Combines research with action to solve problems',
      ko: '문제 해결을 위해 연구와 실행을 결합'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['실제 문제 해결', '조직 개선', '교육 현장', '참여적 연구'],
    strengths: ['즉각적 적용', '참여자 협력', '반복적 개선'],
    limitations: ['일반화 제한', '역할 충돌', '시간 제약'],
    typicalDuration: '6-24개월',
    complexity: 'medium'
  },
  {
    id: 'content-analysis',
    name: { en: 'Content Analysis', ko: '내용분석' },
    description: {
      en: 'Systematic analysis of text or media content',
      ko: '텍스트, 미디어 콘텐츠의 체계적 분석'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['미디어 분석', '문서 연구', '커뮤니케이션 연구', '역사 연구'],
    strengths: ['비침습적', '대량 데이터 분석', '시간에 걸친 비교'],
    limitations: ['맥락 상실', '해석 주관성', '암묵적 의미 파악 어려움'],
    typicalDuration: '2-6개월',
    complexity: 'low'
  },

  // ===== 혼합 연구 방법 =====
  {
    id: 'convergent-mixed',
    name: { en: 'Convergent Mixed Methods', ko: '수렴적 혼합 연구' },
    description: {
      en: 'Collects quantitative and qualitative data simultaneously',
      ko: '양적/질적 데이터를 동시에 수집하고 통합'
    },
    approach: 'mixed-methods',
    category: 'mixed',
    suitableFor: ['현상의 다면적 이해', '결과 검증', '포괄적 분석'],
    strengths: ['삼각검증', '종합적 이해', '상호 보완'],
    limitations: ['자원 집약적', '통합 어려움', '전문성 필요'],
    typicalDuration: '6-18개월',
    complexity: 'high'
  },
  {
    id: 'explanatory-sequential',
    name: { en: 'Explanatory Sequential', ko: '설명적 순차 혼합 연구' },
    description: {
      en: 'Quantitative phase followed by qualitative phase',
      ko: '양적 연구 후 질적 연구로 결과 설명'
    },
    approach: 'mixed-methods',
    category: 'mixed',
    suitableFor: ['양적 결과 심화', '예외 사례 탐구', '메커니즘 이해'],
    strengths: ['결과 설명', '체계적 순서', '양적 우선'],
    limitations: ['시간 소요', '순차적 의존', '표본 연결'],
    typicalDuration: '9-24개월',
    complexity: 'high'
  },
  {
    id: 'exploratory-sequential',
    name: { en: 'Exploratory Sequential', ko: '탐색적 순차 혼합 연구' },
    description: {
      en: 'Qualitative phase to explore, then quantitative to generalize',
      ko: '질적 탐구 후 양적 연구로 일반화'
    },
    approach: 'mixed-methods',
    category: 'mixed',
    suitableFor: ['도구 개발', '새로운 영역 연구', '이론 검증'],
    strengths: ['탐색에서 일반화', '도구 개발', '질적 기반'],
    limitations: ['시간 소요', '단계 간 연결', '질적 결과 양적화'],
    typicalDuration: '12-24개월',
    complexity: 'high'
  },

  // ===== 문헌 기반 연구 (Literature-Based Research) =====
  // 이 카테고리는 실험설계가 필요 없음 - 문헌고찰 전용 워크플로우 사용
  {
    id: 'systematic-review',
    name: { en: 'Systematic Review', ko: '체계적 문헌고찰' },
    description: {
      en: 'Comprehensive review of existing literature following PRISMA guidelines',
      ko: 'PRISMA 가이드라인에 따른 기존 문헌의 포괄적, 체계적 검토'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['기존 연구 종합', '연구 동향 파악', '가이드라인 개발', '근거 기반 의사결정'],
    strengths: ['포괄적 검토', '편향 최소화', '투명한 방법', '재현 가능'],
    limitations: ['출판 편향', '시간 소요', '이질성', '2인 이상 필요'],
    typicalDuration: '6-12개월',
    complexity: 'high'
  },
  {
    id: 'scoping-review',
    name: { en: 'Scoping Review', ko: '주제범위 문헌고찰' },
    description: {
      en: 'Maps existing literature to identify gaps and research scope',
      ko: '기존 문헌을 매핑하여 연구 범위와 격차 파악'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['연구 영역 탐색', '갭 분석', '향후 연구 방향', '개념 명확화'],
    strengths: ['넓은 범위', '유연한 접근', '탐색적', '연구 지형 파악'],
    limitations: ['품질 평가 제한', '깊이 부족'],
    typicalDuration: '3-9개월',
    complexity: 'medium'
  },
  {
    id: 'narrative-review',
    name: { en: 'Narrative Review', ko: '서술적 문헌고찰' },
    description: {
      en: 'Comprehensive summary and synthesis of literature on a topic',
      ko: '특정 주제에 대한 문헌의 포괄적 요약 및 종합'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['주제 개관', '이론적 배경', '교육 목적', '전문가 의견 종합'],
    strengths: ['유연한 접근', '광범위한 주제 포괄', '이해하기 쉬움'],
    limitations: ['체계성 부족', '선택 편향 가능', '재현 어려움'],
    typicalDuration: '2-6개월',
    complexity: 'low'
  },
  {
    id: 'integrative-review',
    name: { en: 'Integrative Review', ko: '통합적 문헌고찰' },
    description: {
      en: 'Integrates diverse methodologies to provide comprehensive understanding',
      ko: '다양한 연구방법론의 결과를 통합하여 포괄적 이해 제공'
    },
    approach: 'mixed-methods',
    category: 'mixed',
    suitableFor: ['이론 개발', '개념 분석', '다양한 근거 종합', '실무 지침 개발'],
    strengths: ['다양한 연구 유형 포함', '포괄적 이해', '이론과 실무 연결'],
    limitations: ['복잡한 분석', '방법론적 엄격성 유지 어려움'],
    typicalDuration: '4-10개월',
    complexity: 'medium'
  },
  {
    id: 'rapid-review',
    name: { en: 'Rapid Review', ko: '신속 문헌고찰' },
    description: {
      en: 'Streamlined systematic review for timely evidence synthesis',
      ko: '시의적절한 근거 종합을 위한 간소화된 체계적 문헌고찰'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['긴급한 정책 결정', '빠른 근거 필요', '예비 검토', '시간 제약 상황'],
    strengths: ['신속함', '시의적절', '의사결정 지원'],
    limitations: ['범위 제한', '편향 위험 증가', '포괄성 부족'],
    typicalDuration: '1-3개월',
    complexity: 'medium'
  },
  {
    id: 'umbrella-review',
    name: { en: 'Umbrella Review', ko: '우산 문헌고찰' },
    description: {
      en: 'Review of systematic reviews and meta-analyses',
      ko: '체계적 문헌고찰과 메타분석들을 종합하는 상위 수준 고찰'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['다수의 체계적 고찰 종합', '근거 수준 평가', '정책 권고', '가이드라인 개발'],
    strengths: ['최상위 근거', '대규모 종합', '중복 연구 방지'],
    limitations: ['기존 리뷰 품질 의존', '원자료 접근 제한', '이중 계산 위험'],
    typicalDuration: '6-12개월',
    complexity: 'high'
  },
  {
    id: 'realist-review',
    name: { en: 'Realist Review', ko: '실재론적 문헌고찰' },
    description: {
      en: 'Theory-driven review focusing on how, why, and for whom interventions work',
      ko: '개입이 어떻게, 왜, 누구에게 효과가 있는지에 초점을 둔 이론 기반 고찰'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['복잡한 개입 평가', '맥락-메커니즘-결과 분석', '정책 개입 연구'],
    strengths: ['맥락 고려', '메커니즘 이해', '이론 개발'],
    limitations: ['복잡한 방법론', '시간 소요', '전문성 필요'],
    typicalDuration: '6-18개월',
    complexity: 'high'
  },
  {
    id: 'critical-review',
    name: { en: 'Critical Review', ko: '비판적 문헌고찰' },
    description: {
      en: 'Critical analysis and evaluation of existing literature',
      ko: '기존 문헌에 대한 비판적 분석 및 평가'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['이론적 비평', '개념적 분석', '연구 방향 제시', '학술적 논쟁'],
    strengths: ['깊이 있는 분석', '새로운 관점 제시', '이론적 기여'],
    limitations: ['주관성', '체계성 부족', '재현 어려움'],
    typicalDuration: '2-6개월',
    complexity: 'medium'
  },
  {
    id: 'qualitative-systematic-review',
    name: { en: 'Qualitative Systematic Review', ko: '질적 체계적 문헌고찰' },
    description: {
      en: 'Systematic synthesis of qualitative research findings',
      ko: '질적 연구 결과의 체계적 종합 (메타합성)'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['질적 연구 종합', '경험/인식 이해', '이론 개발', '메타합성'],
    strengths: ['질적 근거 종합', '풍부한 이해', '이론 생성'],
    limitations: ['해석적 특성', '원자료 접근 제한', '방법론적 다양성'],
    typicalDuration: '6-12개월',
    complexity: 'high'
  }
];

// 키워드 매핑 (추천용)
const METHODOLOGY_KEYWORDS: Record<string, string[]> = {
  'experimental': ['실험', '효과', '처치', '개입', '인과', '비교', '치료', '약물', '테스트', '검증'],
  'quasi-experimental': ['프로그램', '정책', '교육', '훈련', '개입', '효과', '평가'],
  'survey': ['설문', '조사', '인식', '태도', '만족도', '의견', '현황', '실태'],
  'correlational': ['관계', '상관', '영향', '요인', '예측', '연관'],
  'longitudinal': ['추적', '변화', '발달', '장기', '시간', '코호트'],
  'meta-analysis': ['종합', '메타', '효과크기', '체계적', '통합'],
  'phenomenology': ['경험', '체험', '인식', '의미', '본질', '살아있는'],
  'grounded-theory': ['이론', '과정', '상호작용', '단계', '개발', '생성'],
  'case-study': ['사례', '심층', '맥락', '특수', '독특한'],
  'ethnography': ['문화', '집단', '관찰', '현장', '몰입', '참여'],
  'narrative': ['이야기', '생애', '자서전', '서사', '내러티브'],
  'action-research': ['개선', '실행', '현장', '참여', '변화', '협력'],
  'content-analysis': ['분석', '미디어', '텍스트', '담론', '내용', '문서'],
  'convergent-mixed': ['혼합', '통합', '다면적', '종합적', '동시'],
  'explanatory-sequential': ['설명', '심화', '양적질적', '순차'],
  'exploratory-sequential': ['탐색', '도구개발', '질적양적', '개발'],
  // 문헌 기반 연구 키워드
  'systematic-review': ['문헌', '체계적', '리뷰', '고찰', '종합', 'PRISMA', '메타'],
  'scoping-review': ['범위', '동향', '맵핑', '탐색', '개관', '스코핑'],
  'narrative-review': ['서술', '개관', '종설', '리뷰', '요약'],
  'integrative-review': ['통합', '종합', '다양한', '근거'],
  'rapid-review': ['신속', '빠른', '긴급', '정책'],
  'umbrella-review': ['우산', '상위', '리뷰의 리뷰', '오버뷰'],
  'realist-review': ['실재론', '맥락', '메커니즘', 'CMO'],
  'critical-review': ['비판적', '비평', '분석적'],
  'qualitative-systematic-review': ['질적', '메타합성', '메타종합', '경험']
};

/**
 * 연구방법론 추천 함수
 */
export function recommendMethodologies(
  title: string,
  abstract: string,
  preferredApproach?: ResearchApproach,
  topN: number = 5
): MethodologyRecommendation[] {
  const combinedText = `${title} ${abstract}`.toLowerCase();
  const recommendations: MethodologyRecommendation[] = [];

  for (const methodology of METHODOLOGY_CATALOG) {
    const { score, matchedKeywords } = calculateScore(
      methodology,
      combinedText,
      preferredApproach
    );

    if (score > 0) {
      recommendations.push({
        methodology,
        score,
        reasons: generateReasons(methodology, matchedKeywords),
        considerations: generateConsiderations(methodology)
      });
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

function calculateScore(
  methodology: MethodologyMetadata,
  text: string,
  preferredApproach?: ResearchApproach
): { score: number; matchedKeywords: string[] } {
  let score = 0;
  const matchedKeywords: string[] = [];

  // 키워드 매칭
  const keywords = METHODOLOGY_KEYWORDS[methodology.id] || [];
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      score += 12;
      matchedKeywords.push(keyword);
    }
  }
  score = Math.min(score, 60);

  // 선호 접근법 일치
  if (preferredApproach) {
    if (methodology.approach === preferredApproach) {
      score += 25;
    } else if (methodology.approach === 'mixed-methods') {
      score += 15;
    }
  } else {
    score += 10;
  }

  // 키워드 매칭 수에 따른 보너스
  if (matchedKeywords.length >= 3) score += 15;
  else if (matchedKeywords.length >= 2) score += 10;
  else if (matchedKeywords.length >= 1) score += 5;

  // 특정 패턴 인식
  if (/효과|영향|차이|비교|측정|검증/.test(text) && methodology.category === 'quantitative') {
    score += 10;
  }
  if (/경험|인식|의미|이해|탐구|탐색|심층/.test(text) && methodology.category === 'qualitative') {
    score += 10;
  }
  if (/개발|구축|설계|모델|혼합/.test(text) && methodology.category === 'mixed') {
    score += 10;
  }

  return { score, matchedKeywords };
}

function generateReasons(
  methodology: MethodologyMetadata,
  matchedKeywords: string[]
): string[] {
  const reasons: string[] = [];

  if (matchedKeywords.length > 0) {
    reasons.push(`연구 내용에서 '${matchedKeywords.slice(0, 3).join("', '")}' 키워드 발견`);
  }

  reasons.push(...methodology.suitableFor.slice(0, 2).map(s => `${s}에 적합`));

  return reasons;
}

function generateConsiderations(methodology: MethodologyMetadata): string[] {
  const considerations: string[] = [];

  if (methodology.complexity === 'high') {
    considerations.push('높은 연구 복잡도 - 충분한 시간/자원 필요');
  }

  considerations.push(`예상 연구 기간: ${methodology.typicalDuration}`);
  considerations.push(...methodology.limitations.slice(0, 1));

  return considerations;
}

/**
 * 카테고리별 방법론 그룹화
 */
export function getMethodologiesByCategory(): Record<MethodologyCategory, MethodologyMetadata[]> {
  return {
    quantitative: METHODOLOGY_CATALOG.filter(m => m.category === 'quantitative'),
    qualitative: METHODOLOGY_CATALOG.filter(m => m.category === 'qualitative'),
    mixed: METHODOLOGY_CATALOG.filter(m => m.category === 'mixed')
  };
}
