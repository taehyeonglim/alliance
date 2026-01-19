/**
 * 에이전트 정의 데이터
 * Phase 기반 워크플로우 에이전트 메타데이터
 *
 * Phase 1: 연구문제 정교화 (아이디어 빌딩 ↔ 탐색적 문헌검색 루프)
 * Phase 2: 이론적 배경 (집중 문헌검색 → 이론적 배경 작성)
 * Phase 3: 연구 설계 (실험설계 → 데이터분석)
 * Phase 4: 논문 작성 (논문작성 → 포맷팅검토)
 */

import type { Agent } from '../types';

// Phase 정의
export interface Phase {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  agents: string[];
}

export const phases: Phase[] = [
  {
    id: 'research-question',
    name: 'Research Question Refinement',
    nameKo: '연구문제 정교화',
    description: '아이디어 빌딩과 탐색적 문헌검색을 반복하며 연구문제를 정교화합니다.',
    agents: ['idea-building', 'literature-search-exploratory', 'research-question-confirm'],
  },
  {
    id: 'theoretical-background',
    name: 'Theoretical Background',
    nameKo: '이론적 배경',
    description: '집중 문헌검색 후 이론적 배경을 작성합니다.',
    agents: ['literature-search-focused', 'theoretical-background-writing'],
  },
  {
    id: 'research-design',
    name: 'Research Design',
    nameKo: '연구 설계',
    description: '실험을 설계하고 데이터 분석 계획을 수립합니다.',
    agents: ['experiment-design', 'data-analysis'],
  },
  {
    id: 'paper-writing',
    name: 'Paper Writing',
    nameKo: '논문 작성',
    description: '논문을 작성하고 최종 포맷팅을 검토합니다.',
    agents: ['paper-writing', 'formatting-review'],
  },
];

// 실제 에이전트 정의 (Phase 기반 워크플로우)
export const mockAgents: Agent[] = [
  // === Phase 1: 연구문제 정교화 ===
  {
    id: 'idea-building',
    name: 'IdeaBuildingAgent',
    displayName: { en: 'Idea Building', ko: '아이디어 빌딩' },
    description: '연구 아이디어 발굴 및 연구문제 초안 작성 (탐색적 문헌검색과 반복)',
    status: 'idle',
    outputKey: 'research_idea',
    requiresApproval: false,
  },
  {
    id: 'literature-search-exploratory',
    name: 'LiteratureSearchExploratoryAgent',
    displayName: { en: 'Exploratory Literature Search', ko: '탐색적 문헌검색' },
    description: '넓은 범위의 관련 문헌 탐색 및 동향 파악',
    status: 'idle',
    outputKey: 'exploratory_literature',
    requiresApproval: false,
  },
  {
    id: 'research-question-confirm',
    name: 'ResearchQuestionConfirmAgent',
    displayName: { en: 'Research Question Confirmation', ko: '연구문제 확정' },
    description: '정교화된 연구문제 요약 및 인간 승인 요청',
    status: 'idle',
    outputKey: 'confirmed_research_questions',
    requiresApproval: true,
  },

  // === Phase 2: 이론적 배경 ===
  {
    id: 'literature-search-focused',
    name: 'LiteratureSearchFocusedAgent',
    displayName: { en: 'Focused Literature Search', ko: '집중 문헌검색' },
    description: '확정된 연구문제 기반 심층 문헌 검색 및 분석',
    status: 'idle',
    outputKey: 'focused_literature',
    requiresApproval: false,
  },
  {
    id: 'theoretical-background-writing',
    name: 'TheoreticalBackgroundWritingAgent',
    displayName: { en: 'Theoretical Background Writing', ko: '이론적 배경 작성' },
    description: '문헌 리뷰 기반 이론적 배경 및 선행연구 고찰 작성',
    status: 'idle',
    outputKey: 'theoretical_background',
    requiresApproval: true,
  },

  // === Phase 3: 연구 설계 ===
  {
    id: 'experiment-design',
    name: 'ExperimentDesignAgent',
    displayName: { en: 'Experiment Design', ko: '실험 설계' },
    description: '연구 방법론 및 실험 프로토콜 설계',
    status: 'idle',
    outputKey: 'experiment_design',
    requiresApproval: true,
  },
  {
    id: 'data-analysis',
    name: 'DataAnalysisAgent',
    displayName: { en: 'Data Analysis', ko: '데이터 분석' },
    description: '통계 분석 계획 및 결과 시각화 설계',
    status: 'idle',
    outputKey: 'analysis_results',
    requiresApproval: false,
  },

  // === Phase 4: 논문 작성 ===
  {
    id: 'paper-writing',
    name: 'PaperWritingAgent',
    displayName: { en: 'Paper Writing', ko: '논문 작성' },
    description: '논문 초안 작성 (서론, 방법, 결과, 논의)',
    status: 'idle',
    outputKey: 'paper_draft',
    requiresApproval: true,
  },
  {
    id: 'formatting-review',
    name: 'FormattingReviewAgent',
    displayName: { en: 'Formatting Review', ko: '포맷팅 검토' },
    description: '저널 형식 검토 및 최종 교정',
    status: 'idle',
    outputKey: 'final_document',
    requiresApproval: true,
  },
];

// 에이전트 ID로 Phase 찾기
export function getPhaseByAgentId(agentId: string): Phase | undefined {
  return phases.find(phase => phase.agents.includes(agentId));
}

// 에이전트 ID로 에이전트 찾기
export function getAgentById(agentId: string): Agent | undefined {
  return mockAgents.find(agent => agent.id === agentId);
}
