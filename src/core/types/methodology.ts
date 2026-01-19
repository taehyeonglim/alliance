/**
 * 연구방법론 타입 정의
 * Research Methodology Types
 */

// 연구 패러다임 (Research Paradigm)
export type ResearchParadigm =
  | 'positivist'      // 실증주의 - 객관적 현실, 측정 가능
  | 'interpretivist'  // 해석주의 - 주관적 의미, 맥락 중시
  | 'critical'        // 비판주의 - 사회적 변화, 권력 관계
  | 'pragmatic';      // 실용주의 - 문제 해결 중심, 혼합 가능

// 연구 접근법 (Research Approach)
export type ResearchApproach =
  | 'quantitative'    // 양적 연구
  | 'qualitative'     // 질적 연구
  | 'mixed-methods';  // 혼합 연구

// 양적 연구 방법 (Quantitative Methods)
export type QuantitativeMethod =
  | 'experimental'           // 실험 연구
  | 'quasi-experimental'     // 준실험 연구
  | 'correlational'          // 상관 연구
  | 'survey'                 // 설문조사 연구
  | 'longitudinal'           // 종단 연구
  | 'cross-sectional'        // 횡단 연구
  | 'meta-analysis'          // 메타분석
  | 'secondary-data';        // 2차 데이터 분석

// 질적 연구 방법 (Qualitative Methods)
export type QualitativeMethod =
  | 'phenomenology'          // 현상학
  | 'grounded-theory'        // 근거이론
  | 'ethnography'            // 민족지학/문화기술지
  | 'case-study'             // 사례연구
  | 'narrative'              // 내러티브 연구
  | 'action-research'        // 실행연구
  | 'content-analysis'       // 내용분석
  | 'discourse-analysis'     // 담론분석
  | 'thematic-analysis';     // 주제분석

// 혼합 연구 설계 (Mixed Methods Designs)
export type MixedMethodsDesign =
  | 'convergent'             // 수렴적 설계 (동시 수집)
  | 'explanatory-sequential' // 설명적 순차 설계 (양적→질적)
  | 'exploratory-sequential' // 탐색적 순차 설계 (질적→양적)
  | 'embedded'               // 내재적 설계
  | 'transformative'         // 변혁적 설계
  | 'multiphase';            // 다단계 설계

// 데이터 수집 방법 (Data Collection Methods)
export type DataCollectionMethod =
  // 양적
  | 'questionnaire'          // 설문지
  | 'structured-observation' // 구조화된 관찰
  | 'experiment'             // 실험
  | 'physiological-measures' // 생리적 측정
  | 'existing-data'          // 기존 데이터
  // 질적
  | 'interview'              // 인터뷰
  | 'focus-group'            // 포커스 그룹
  | 'participant-observation'// 참여관찰
  | 'document-analysis'      // 문서분석
  | 'visual-methods';        // 시각적 방법

// 샘플링 방법 (Sampling Methods)
export type SamplingMethod =
  // 확률적 (양적)
  | 'simple-random'          // 단순 무작위
  | 'stratified'             // 층화
  | 'cluster'                // 군집
  | 'systematic'             // 체계적
  // 비확률적 (질적)
  | 'purposive'              // 목적적
  | 'snowball'               // 눈덩이
  | 'convenience'            // 편의
  | 'theoretical';           // 이론적

// 연구방법론 전체 구조
export interface ResearchMethodology {
  id: string;
  approach: ResearchApproach;
  paradigm?: ResearchParadigm;

  // 양적 연구 설정
  quantitative?: {
    method: QuantitativeMethod;
    design?: string;
    variables?: {
      independent?: string[];
      dependent?: string[];
      control?: string[];
    };
    hypotheses?: string[];
  };

  // 질적 연구 설정
  qualitative?: {
    method: QualitativeMethod;
    approach?: string;
    researchQuestions?: string[];
  };

  // 혼합 연구 설정
  mixedMethods?: {
    design: MixedMethodsDesign;
    priority: 'quantitative' | 'qualitative' | 'equal';
    sequence: 'concurrent' | 'sequential';
    integration: string;
  };

  // 공통 설정
  dataCollection: DataCollectionMethod[];
  sampling: SamplingMethod;
  analysisMethod?: string;
}

// 연구방법론 메타데이터 (UI 표시용)
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
  category: 'quantitative' | 'qualitative' | 'mixed';
  suitableFor: string[];  // 적합한 연구 주제/상황
  strengths: string[];    // 장점
  limitations: string[];  // 한계점
  typicalDuration: string; // 일반적 소요 기간
  complexity: 'low' | 'medium' | 'high';
}

// 전체 연구방법론 카탈로그
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
      en: 'Similar to experiments but without random assignment, often used in natural settings',
      ko: '실험과 유사하나 무작위 배정 없이, 자연적 상황에서 수행'
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
      en: 'Collects data from a sample through questionnaires to describe population characteristics',
      ko: '설문지를 통해 표본에서 데이터를 수집하여 모집단 특성 기술'
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
      en: 'Follows same subjects over extended period to observe changes',
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
      en: 'Develops theory grounded in systematically collected and analyzed data',
      ko: '체계적으로 수집/분석된 데이터에 기반하여 이론 개발'
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
      en: 'In-depth investigation of a single case or multiple cases in real-life context',
      ko: '실제 맥락에서 단일 또는 다중 사례에 대한 심층 조사'
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
      en: 'Studies culture and social practices through prolonged immersion',
      ko: '장기간 몰입을 통해 문화와 사회적 관행 연구'
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
      en: 'Explores individual stories and experiences through narrative analysis',
      ko: '내러티브 분석을 통해 개인의 이야기와 경험 탐구'
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
      en: 'Combines research with action to solve practical problems',
      ko: '실제 문제 해결을 위해 연구와 실행을 결합'
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
      en: 'Systematic analysis of text, images, or media content',
      ko: '텍스트, 이미지, 미디어 콘텐츠의 체계적 분석'
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
      en: 'Collects quantitative and qualitative data simultaneously, then integrates',
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
      en: 'Quantitative phase followed by qualitative phase to explain results',
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
      en: 'Qualitative phase to explore, then quantitative phase to generalize',
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

  // ===== 문헌 연구 =====
  {
    id: 'systematic-review',
    name: { en: 'Systematic Review', ko: '체계적 문헌고찰' },
    description: {
      en: 'Comprehensive, systematic review of existing literature on a topic',
      ko: '특정 주제에 대한 기존 문헌의 포괄적, 체계적 검토'
    },
    approach: 'quantitative',
    category: 'quantitative',
    suitableFor: ['기존 연구 종합', '연구 동향 파악', '가이드라인 개발'],
    strengths: ['포괄적 검토', '편향 최소화', '투명한 방법'],
    limitations: ['출판 편향', '시간 소요', '이질성'],
    typicalDuration: '6-12개월',
    complexity: 'medium'
  },
  {
    id: 'scoping-review',
    name: { en: 'Scoping Review', ko: '주제범위 문헌고찰' },
    description: {
      en: 'Maps existing literature to identify gaps and scope of research area',
      ko: '기존 문헌을 매핑하여 연구 영역의 범위와 격차 파악'
    },
    approach: 'qualitative',
    category: 'qualitative',
    suitableFor: ['연구 영역 탐색', '갭 분석', '향후 연구 방향'],
    strengths: ['넓은 범위', '유연한 접근', '탐색적'],
    limitations: ['품질 평가 제한', '깊이 부족'],
    typicalDuration: '3-9개월',
    complexity: 'medium'
  }
];

// 연구방법론 추천을 위한 키워드 매핑
export const METHODOLOGY_KEYWORDS: Record<string, string[]> = {
  'experimental': ['실험', '효과', '처치', '개입', '인과', '비교', '치료', '약물', '테스트'],
  'quasi-experimental': ['프로그램', '정책', '교육', '훈련', '개입', '효과'],
  'survey': ['설문', '조사', '인식', '태도', '만족도', '의견', '현황'],
  'correlational': ['관계', '상관', '영향', '요인', '예측'],
  'longitudinal': ['추적', '변화', '발달', '장기', '시간'],
  'meta-analysis': ['종합', '메타', '효과크기', '체계적'],
  'phenomenology': ['경험', '체험', '인식', '의미', '본질'],
  'grounded-theory': ['이론', '과정', '상호작용', '단계'],
  'case-study': ['사례', '심층', '맥락', '특수'],
  'ethnography': ['문화', '집단', '관찰', '현장'],
  'narrative': ['이야기', '생애', '자서전', '서사'],
  'action-research': ['개선', '실행', '현장', '참여', '변화'],
  'content-analysis': ['분석', '미디어', '텍스트', '담론', '내용'],
  'convergent-mixed': ['혼합', '통합', '다면적', '종합적'],
  'explanatory-sequential': ['설명', '심화', '양적질적'],
  'exploratory-sequential': ['탐색', '도구개발', '질적양적'],
  'systematic-review': ['문헌', '체계적', '리뷰', '고찰'],
  'scoping-review': ['범위', '동향', '맵핑']
};

// 연구방법론 추천 결과
export interface MethodologyRecommendation {
  methodology: MethodologyMetadata;
  score: number;           // 적합도 점수 (0-100)
  reasons: string[];       // 추천 이유
  considerations: string[]; // 고려사항
}
