/**
 * Alliance Research Workflow - Firebase Cloud Functions
 *
 * Phase 기반 반복적 정교화 워크플로우
 * Phase 1: 연구문제 정교화 (아이디어 빌딩 ↔ 문헌검색 루프)
 * Phase 2: 이론적 배경 작성
 * Phase 3: 연구 설계 및 실행
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Firebase Admin 초기화
admin.initializeApp();
const db = admin.firestore();

// Gemini AI 인스턴스 (런타임에 초기화)
let genAI: GoogleGenerativeAI | null = null;

/**
 * Firestore에서 API 키를 가져와서 Gemini 초기화
 */
async function getGeminiAI(): Promise<GoogleGenerativeAI> {
  if (genAI) return genAI;

  let apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    try {
      const configDoc = await db.collection('config').doc('api_keys').get();
      if (configDoc.exists) {
        apiKey = configDoc.data()?.gemini_api_key;
      }
    } catch (error) {
      console.error('Failed to get API key from Firestore:', error);
    }
  }

  if (!apiKey) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY or add to Firestore config/api_keys.');
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

// ============================================
// Phase 정의
// ============================================

interface PhaseDefinition {
  id: string;
  name: string;
  nameKo: string;
  description: string;
}

const PHASES: Record<string, PhaseDefinition> = {
  'research-question': {
    id: 'research-question',
    name: 'Research Question Refinement',
    nameKo: '연구문제 정교화',
    description: '아이디어 빌딩과 문헌검색을 반복하며 연구문제를 정교화합니다.',
  },
  'theoretical-background': {
    id: 'theoretical-background',
    name: 'Theoretical Background',
    nameKo: '이론적 배경',
    description: '확정된 연구문제를 바탕으로 심층 문헌검색 및 이론적 배경을 작성합니다.',
  },
  'research-design': {
    id: 'research-design',
    name: 'Research Design',
    nameKo: '연구 설계',
    description: '실험 설계, 데이터 분석 계획을 수립합니다.',
  },
  'paper-writing': {
    id: 'paper-writing',
    name: 'Paper Writing',
    nameKo: '논문 작성',
    description: '논문 초안 작성 및 포맷팅 검토를 진행합니다.',
  },
};

// ============================================
// 에이전트 정의 (Phase별 역할 구분)
// ============================================

interface AgentDefinition {
  id: string;
  name: string;
  displayName: { ko: string; en: string };
  outputKey: string;
  phase: string;
  mode?: string; // 같은 에이전트의 다른 모드 (exploratory, focused 등)
  requiresApproval: boolean;
  instruction: string;
}

const AGENTS: Record<string, AgentDefinition> = {
  // Phase 1: 연구문제 정교화
  'idea-building': {
    id: 'idea-building',
    name: 'Idea Building Agent',
    displayName: { ko: '아이디어 빌딩', en: 'Idea Building' },
    outputKey: 'research_idea',
    phase: 'research-question',
    requiresApproval: false,
    instruction: `당신은 연구 아이디어를 구체화하는 AI 연구 조교입니다.

## 역할
주어진 연구 주제와 이전 문헌검색 결과를 바탕으로 연구 아이디어를 정교화합니다.

## 출력 형식
다음 항목을 포함해서 작성해주세요:

### 1. 연구 배경
- 연구의 필요성과 맥락

### 2. 잠정적 연구 질문 (3-5개)
- 각 연구 질문의 학술적 의의 포함

### 3. 핵심 개념 정의
- 주요 개념들의 조작적 정의

### 4. 추가 탐색이 필요한 영역
- 문헌검색 에이전트가 더 찾아봐야 할 주제

학술적이고 명확한 톤으로 작성해주세요.`,
  },

  'literature-search-exploratory': {
    id: 'literature-search-exploratory',
    name: 'Literature Search Agent (Exploratory)',
    displayName: { ko: '문헌검색 (탐색)', en: 'Literature Search (Exploratory)' },
    outputKey: 'literature_exploratory',
    phase: 'research-question',
    mode: 'exploratory',
    requiresApproval: false,
    instruction: `당신은 학술 문헌 검색 전문가입니다.

## 역할
연구 아이디어를 바탕으로 광범위한 탐색적 문헌검색을 수행합니다.

## 출력 형식

### 1. 검색 키워드
- 한글 키워드: [목록]
- 영문 키워드: [목록]
- 조합 검색어: [목록]

### 2. 관련 연구 분야
- 주요 학문 분야와 세부 영역

### 3. 핵심 선행연구 (가상)
- 주제와 관련된 주요 연구 동향
- 연구 갭(gap) 분석

### 4. 추천 데이터베이스
- KCI, RISS, SCOPUS, Web of Science 등
- 각 데이터베이스별 검색 전략

### 5. 아이디어 빌딩을 위한 제안
- 발견된 연구 동향을 바탕으로 연구 방향 제안
- 차별화 포인트 제시

체계적이고 학술적인 방식으로 작성해주세요.`,
  },

  'research-question-confirm': {
    id: 'research-question-confirm',
    name: 'Research Question Confirmation',
    displayName: { ko: '연구문제 확정', en: 'Research Question Confirmation' },
    outputKey: 'confirmed_research_question',
    phase: 'research-question',
    requiresApproval: true, // 연구자 승인 필요!
    instruction: `당신은 연구 설계 전문가입니다.

## 역할
지금까지의 아이디어 빌딩과 문헌검색 결과를 종합하여 최종 연구문제를 제안합니다.

## 출력 형식

### 1. 최종 연구 질문
- 주 연구 질문 (Main Research Question)
- 세부 연구 질문 1-3개 (Sub Research Questions)

### 2. 연구의 학술적 의의
- 이론적 기여
- 실천적 기여

### 3. 연구 범위
- 연구 대상
- 시간적/공간적 범위
- 제한점

### 4. 예상 연구 방법 개요
- 연구 설계 유형
- 데이터 수집 방법 (개략)

### 5. 다음 단계 안내
- 이론적 배경 작성을 위한 심층 문헌검색 방향

---
⚠️ 연구자님의 승인이 필요합니다.
위 연구문제가 적절한지 검토해주세요.
수정이 필요하면 피드백을 남겨주세요.`,
  },

  // Phase 2: 이론적 배경
  'literature-search-focused': {
    id: 'literature-search-focused',
    name: 'Literature Search Agent (Focused)',
    displayName: { ko: '문헌검색 (심층)', en: 'Literature Search (Focused)' },
    outputKey: 'literature_focused',
    phase: 'theoretical-background',
    mode: 'focused',
    requiresApproval: false,
    instruction: `당신은 학술 문헌 검색 전문가입니다.

## 역할
확정된 연구문제를 바탕으로 심층적이고 집중적인 문헌검색을 수행합니다.

## 컨텍스트
연구자가 연구문제를 확정했습니다. 이제 이론적 배경 작성에 필요한 핵심 문헌을 찾아야 합니다.

## 출력 형식

### 1. 핵심 이론 및 모델
- 연구에 적용할 수 있는 주요 이론
- 각 이론의 핵심 개념과 적용 방법

### 2. 주요 선행연구 분류
#### 2.1 직접 관련 연구
- 동일/유사 주제의 핵심 연구들

#### 2.2 방법론 참고 연구
- 유사한 방법론을 사용한 연구들

#### 2.3 이론적 기반 연구
- 이론적 토대가 되는 연구들

### 3. 연구 동향 요약
- 시기별 연구 흐름
- 최신 연구 동향

### 4. 연구 갭 분석
- 기존 연구의 한계점
- 본 연구의 차별화 포인트

### 5. 이론적 배경 구성 제안
- 추천 목차 구성
- 각 섹션별 핵심 내용`,
  },

  'theoretical-background-writing': {
    id: 'theoretical-background-writing',
    name: 'Theoretical Background Writing Agent',
    displayName: { ko: '이론적 배경 작성', en: 'Theoretical Background Writing' },
    outputKey: 'theoretical_background',
    phase: 'theoretical-background',
    requiresApproval: true,
    instruction: `당신은 학술 논문 작성 전문가입니다.

## 역할
심층 문헌검색 결과를 바탕으로 이론적 배경 섹션을 작성합니다.

## 출력 형식

### Ⅱ. 이론적 배경

#### 1. [첫 번째 핵심 개념]
1.1 개념 정의
1.2 관련 이론
1.3 선행연구 검토

#### 2. [두 번째 핵심 개념]
2.1 개념 정의
2.2 관련 이론
2.3 선행연구 검토

#### 3. [변수 간 관계]
3.1 개념 간 관계
3.2 선행연구에서의 관계

#### 4. 연구 모형 및 가설
4.1 연구 모형
4.2 연구 가설

---
⚠️ 연구자님의 검토가 필요합니다.
이론적 배경의 구성과 내용이 적절한지 확인해주세요.`,
  },

  // Phase 3: 연구 설계
  'experiment-design': {
    id: 'experiment-design',
    name: 'Experiment Design Agent',
    displayName: { ko: '연구 설계', en: 'Research Design' },
    outputKey: 'experiment_design',
    phase: 'research-design',
    requiresApproval: true,
    instruction: `당신은 연구 방법론 전문가입니다.

## 역할
확정된 연구문제와 이론적 배경을 바탕으로 연구 설계를 수립합니다.

## 출력 형식

### Ⅲ. 연구 방법

#### 1. 연구 설계
- 연구 유형 (실험/준실험/조사/질적 등)
- 연구 설계의 근거

#### 2. 연구 대상
- 모집단 정의
- 표본 추출 방법
- 표본 크기 및 산출 근거

#### 3. 측정 도구
- 각 변수별 측정 도구
- 신뢰도/타당도 정보

#### 4. 자료 수집 절차
- 수집 방법 및 기간
- 윤리적 고려사항

#### 5. 자료 분석 방법
- 분석 기법
- 사용 소프트웨어

---
⚠️ 연구자님의 승인이 필요합니다.`,
  },

  'data-analysis': {
    id: 'data-analysis',
    name: 'Data Analysis Agent',
    displayName: { ko: '데이터 분석', en: 'Data Analysis' },
    outputKey: 'analysis_results',
    phase: 'research-design',
    requiresApproval: false,
    instruction: `당신은 데이터 분석 전문가입니다.

## 역할
연구 설계에 따른 상세 분석 계획을 수립합니다.

## 출력 형식

### 1. 기술통계 분석
- 분석 항목 및 방법

### 2. 추론통계 분석
- 가설별 분석 방법
- 전제조건 검증 방법

### 3. 분석 코드 예시
- R 또는 Python 코드 샘플

### 4. 결과 해석 가이드
- 예상 결과 시나리오별 해석`,
  },

  // Phase 4: 논문 작성
  'paper-writing': {
    id: 'paper-writing',
    name: 'Paper Writing Agent',
    displayName: { ko: '논문 작성', en: 'Paper Writing' },
    outputKey: 'paper_draft',
    phase: 'paper-writing',
    requiresApproval: true,
    instruction: `당신은 학술 논문 작성 전문가입니다.

## 역할
지금까지의 모든 결과를 통합하여 논문 초안을 작성합니다.

## 출력 형식

### 제목
[한글 제목]
[영문 제목]

### 초록
[연구 목적, 방법, 결과, 결론 포함 - 약 300단어]

### 키워드
[5개 내외]

### 본문 개요
1. 서론 (초안)
2. 이론적 배경 (요약 연결)
3. 연구 방법 (요약 연결)
4. 예상 결과
5. 논의
6. 결론

### 참고문헌 형식 안내

---
⚠️ 연구자님의 검토가 필요합니다.`,
  },

  'formatting-review': {
    id: 'formatting-review',
    name: 'Formatting Review Agent',
    displayName: { ko: '포맷팅 검토', en: 'Formatting Review' },
    outputKey: 'final_document',
    phase: 'paper-writing',
    requiresApproval: true,
    instruction: `당신은 학술 논문 편집 전문가입니다.

## 역할
논문 초안의 형식과 스타일을 검토합니다.

## 출력 형식

### 1. 형식 검토 결과
- APA 7th 또는 학술지 형식 적합성
- 수정 필요 항목 목록

### 2. 문체 검토 결과
- 학술적 문체 적절성
- 일관성 검토

### 3. 최종 체크리스트
- [ ] 제목 형식
- [ ] 초록 형식
- [ ] 본문 구조
- [ ] 참고문헌 형식
- [ ] 표/그림 형식

### 4. 최종 권고사항

---
⚠️ 최종 검토입니다. 승인 시 완료됩니다.`,
  },
};

// ============================================
// 워크플로우 Phase 흐름 정의
// ============================================

interface WorkflowPhase {
  phaseId: string;
  agents: string[];
  loopAgents?: string[]; // 반복 가능한 에이전트 쌍
  approvalGate?: string; // Phase 종료 전 승인 게이트
}

const WORKFLOW_PHASES: WorkflowPhase[] = [
  {
    phaseId: 'research-question',
    agents: ['idea-building', 'literature-search-exploratory', 'research-question-confirm'],
    loopAgents: ['idea-building', 'literature-search-exploratory'], // 이 둘은 반복 가능
    approvalGate: 'research-question-confirm',
  },
  {
    phaseId: 'theoretical-background',
    agents: ['literature-search-focused', 'theoretical-background-writing'],
    approvalGate: 'theoretical-background-writing',
  },
  {
    phaseId: 'research-design',
    agents: ['experiment-design', 'data-analysis'],
    approvalGate: 'experiment-design',
  },
  {
    phaseId: 'paper-writing',
    agents: ['paper-writing', 'formatting-review'],
    approvalGate: 'formatting-review',
  },
];

// ============================================
// 워크플로우 실행 로직
// ============================================

/**
 * 워크플로우 생성 시 자동 실행
 */
export const onWorkflowCreated = functions
  .region('asia-northeast3')
  .firestore.document('workflows/{workflowId}')
  .onCreate(async (snapshot, context) => {
    const workflowId = context.params.workflowId;
    const workflow = snapshot.data();

    console.log(`[Workflow Created] ${workflowId}: ${workflow.name}`);

    // Phase 기반 steps 생성
    const steps = generateWorkflowSteps();

    // 워크플로우 초기화
    await db.collection('workflows').doc(workflowId).update({
      status: 'running',
      currentPhase: 'research-question',
      currentAgent: 'idea-building',
      phaseIteration: 1, // Phase 내 반복 횟수
      steps,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await addLog(workflowId, 'info', 'system', `워크플로우 시작: ${workflow.name}`);
    await addLog(workflowId, 'info', 'system', `Phase 1: 연구문제 정교화 시작`);

    // 첫 번째 에이전트 실행
    await executeAgent(workflowId, 'idea-building', {
      researchTopic: workflow.researchTopic,
      name: workflow.name,
    });
  });

/**
 * 워크플로우 steps 생성
 */
function generateWorkflowSteps(): any[] {
  const steps: any[] = [];

  WORKFLOW_PHASES.forEach((phase) => {
    phase.agents.forEach((agentId) => {
      steps.push({
        agentId,
        phaseId: phase.phaseId,
        phaseName: PHASES[phase.phaseId].nameKo,
        status: 'idle',
        isLoopAgent: phase.loopAgents?.includes(agentId) || false,
        isApprovalGate: phase.approvalGate === agentId,
      });
    });
  });

  return steps;
}

/**
 * 에이전트 실행
 */
async function executeAgent(
  workflowId: string,
  agentId: string,
  context: Record<string, any>
): Promise<void> {
  const agent = AGENTS[agentId];
  if (!agent) {
    console.error(`Unknown agent: ${agentId}`);
    return;
  }

  console.log(`[Agent Start] ${workflowId} - ${agent.displayName.ko}`);

  await updateWorkflowStep(workflowId, agentId, 'running');
  await addLog(workflowId, 'info', agentId, `${agent.displayName.ko} 에이전트 시작`);

  try {
    const ai = await getGeminiAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildPrompt(agent, context);
    console.log(`[Agent Prompt] ${agentId}:`, prompt.substring(0, 300) + '...');

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log(`[Agent Response] ${agentId}:`, text.substring(0, 200) + '...');

    // 결과 저장
    await db.collection('workflows').doc(workflowId).update({
      [`results.${agent.outputKey}`]: text,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await addLog(workflowId, 'info', agentId, `${agent.displayName.ko} 완료`);

    // 승인 필요 여부 확인
    if (agent.requiresApproval) {
      await handleApprovalGate(workflowId, agentId, text);
    } else {
      await updateWorkflowStep(workflowId, agentId, 'completed');
      await proceedToNextAgent(workflowId, agentId);
    }
  } catch (error) {
    console.error(`[Agent Error] ${agentId}:`, error);
    await updateWorkflowStep(workflowId, agentId, 'error');
    await db.collection('workflows').doc(workflowId).update({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await addLog(workflowId, 'error', agentId, `오류: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

/**
 * 승인 게이트 처리
 */
async function handleApprovalGate(
  workflowId: string,
  agentId: string,
  content: string
): Promise<void> {
  await updateWorkflowStep(workflowId, agentId, 'pending_approval');

  const workflowDoc = await db.collection('workflows').doc(workflowId).get();
  const workflow = workflowDoc.data();
  const agent = AGENTS[agentId];

  // Phase 정보 포함한 승인 요청 생성
  const phase = PHASES[agent.phase];

  await db.collection('approvals').add({
    workflowId,
    workflowName: workflow?.name || 'Unknown',
    agentId,
    agentName: agent.displayName.ko,
    phaseId: agent.phase,
    phaseName: phase.nameKo,
    content: content.substring(0, 2000),
    outputPreview: content.substring(0, 500),
    output: content,
    status: 'pending',
    priority: agentId === 'research-question-confirm' ? 'high' : 'medium',
    approvalType: agentId === 'research-question-confirm' ? 'phase_gate' : 'standard',
    canRequestRevision: true, // 수정 요청 가능
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('workflows').doc(workflowId).update({
    status: 'pending_approval',
    currentAgent: agentId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await addLog(workflowId, 'warn', agentId, `승인 대기: ${agent.displayName.ko}`);
}

/**
 * 다음 에이전트로 진행
 */
async function proceedToNextAgent(workflowId: string, currentAgentId: string): Promise<void> {
  const workflowDoc = await db.collection('workflows').doc(workflowId).get();
  const workflow = workflowDoc.data();

  if (!workflow) return;

  const currentPhase = workflow.currentPhase;
  const phaseConfig = WORKFLOW_PHASES.find(p => p.phaseId === currentPhase);

  if (!phaseConfig) return;

  const agentIndex = phaseConfig.agents.indexOf(currentAgentId);

  // Phase 내 다음 에이전트가 있으면 실행
  if (agentIndex < phaseConfig.agents.length - 1) {
    const nextAgentId = phaseConfig.agents[agentIndex + 1];

    // 진행률 계산
    const progress = calculateProgress(workflow, nextAgentId);

    await db.collection('workflows').doc(workflowId).update({
      currentAgent: nextAgentId,
      progress,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const context = buildAgentContext(workflow);
    await executeAgent(workflowId, nextAgentId, context);
  } else {
    // Phase 완료 - 다음 Phase로
    await proceedToNextPhase(workflowId);
  }
}

/**
 * 다음 Phase로 진행
 */
async function proceedToNextPhase(workflowId: string): Promise<void> {
  const workflowDoc = await db.collection('workflows').doc(workflowId).get();
  const workflow = workflowDoc.data();

  if (!workflow) return;

  const currentPhaseIndex = WORKFLOW_PHASES.findIndex(p => p.phaseId === workflow.currentPhase);

  if (currentPhaseIndex >= WORKFLOW_PHASES.length - 1) {
    // 모든 Phase 완료
    await db.collection('workflows').doc(workflowId).update({
      status: 'completed',
      progress: 100,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await addLog(workflowId, 'info', 'system', '🎉 워크플로우 완료!');
    return;
  }

  const nextPhase = WORKFLOW_PHASES[currentPhaseIndex + 1];
  const nextAgent = nextPhase.agents[0];

  await addLog(workflowId, 'info', 'system', `Phase ${currentPhaseIndex + 2}: ${PHASES[nextPhase.phaseId].nameKo} 시작`);

  await db.collection('workflows').doc(workflowId).update({
    currentPhase: nextPhase.phaseId,
    currentAgent: nextAgent,
    phaseIteration: 1,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const context = buildAgentContext(workflow);
  await executeAgent(workflowId, nextAgent, context);
}

/**
 * 프롬프트 생성
 */
function buildPrompt(agent: AgentDefinition, context: Record<string, any>): string {
  let prompt = agent.instruction + '\n\n';
  prompt += '---\n\n';
  prompt += `## 연구 주제\n${context.researchTopic || context.name}\n\n`;

  // 이전 결과 포함
  if (context.research_idea) {
    prompt += `## 현재 연구 아이디어\n${context.research_idea}\n\n`;
  }
  if (context.literature_exploratory) {
    prompt += `## 탐색적 문헌검색 결과\n${context.literature_exploratory}\n\n`;
  }
  if (context.confirmed_research_question) {
    prompt += `## 확정된 연구문제\n${context.confirmed_research_question}\n\n`;
  }
  if (context.literature_focused) {
    prompt += `## 심층 문헌검색 결과\n${context.literature_focused}\n\n`;
  }
  if (context.theoretical_background) {
    prompt += `## 이론적 배경\n${context.theoretical_background}\n\n`;
  }
  if (context.experiment_design) {
    prompt += `## 연구 설계\n${context.experiment_design}\n\n`;
  }
  if (context.analysis_results) {
    prompt += `## 분석 계획\n${context.analysis_results}\n\n`;
  }
  if (context.paper_draft) {
    prompt += `## 논문 초안\n${context.paper_draft}\n\n`;
  }

  // 연구자 피드백 포함
  if (context.researcher_feedback) {
    prompt += `## 연구자 피드백\n${context.researcher_feedback}\n\n`;
    prompt += `위 피드백을 반영하여 수정해주세요.\n\n`;
  }

  return prompt;
}

/**
 * 에이전트 컨텍스트 빌드
 */
function buildAgentContext(workflow: any): Record<string, any> {
  return {
    researchTopic: workflow.researchTopic,
    name: workflow.name,
    ...workflow.results,
    researcher_feedback: workflow.lastFeedback,
  };
}

/**
 * 진행률 계산
 */
function calculateProgress(workflow: any, currentAgentId: string): number {
  const allAgents = WORKFLOW_PHASES.flatMap(p => p.agents);
  const currentIndex = allAgents.indexOf(currentAgentId);
  return Math.round((currentIndex / allAgents.length) * 100);
}

/**
 * 워크플로우 단계 상태 업데이트
 */
async function updateWorkflowStep(
  workflowId: string,
  agentId: string,
  status: 'idle' | 'running' | 'completed' | 'error' | 'pending_approval'
): Promise<void> {
  const workflowDoc = await db.collection('workflows').doc(workflowId).get();
  const workflow = workflowDoc.data();

  if (!workflow) return;

  const steps = workflow.steps || [];
  const updatedSteps = steps.map((step: any) =>
    step.agentId === agentId ? { ...step, status } : step
  );

  await db.collection('workflows').doc(workflowId).update({
    steps: updatedSteps,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * 로그 추가
 */
async function addLog(
  workflowId: string,
  level: 'info' | 'warn' | 'error',
  agentId: string,
  message: string
): Promise<void> {
  await db.collection('logs').add({
    workflowId,
    level,
    agentId,
    message,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ============================================
// HTTP Callable Functions
// ============================================

/**
 * 승인 처리
 */
export const processApproval = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    const { approvalId, action, feedback } = data;

    if (!approvalId || !action) {
      throw new functions.https.HttpsError('invalid-argument', 'approvalId and action are required');
    }

    const approvalDoc = await db.collection('approvals').doc(approvalId).get();
    const approval = approvalDoc.data();

    if (!approval) {
      throw new functions.https.HttpsError('not-found', 'Approval not found');
    }

    const workflowId = approval.workflowId;
    const agentId = approval.agentId;

    await db.collection('approvals').doc(approvalId).update({
      status: action === 'approve' ? 'approved' : action === 'revise' ? 'revision_requested' : 'rejected',
      feedback: feedback || null,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (action === 'approve') {
      // 승인 - 다음 단계로
      await updateWorkflowStep(workflowId, agentId, 'completed');
      await db.collection('workflows').doc(workflowId).update({
        status: 'running',
        lastFeedback: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await addLog(workflowId, 'info', agentId, '✅ 승인됨 - 다음 단계 진행');
      await proceedToNextAgent(workflowId, agentId);

    } else if (action === 'revise') {
      // 수정 요청 - Phase 1의 루프 에이전트면 다시 반복
      const agent = AGENTS[agentId];
      const phaseConfig = WORKFLOW_PHASES.find(p => p.phaseId === agent.phase);

      await db.collection('workflows').doc(workflowId).update({
        status: 'running',
        lastFeedback: feedback,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Phase 1에서 연구문제 확정이면, 아이디어 빌딩부터 다시 시작
      if (agentId === 'research-question-confirm' && phaseConfig?.loopAgents) {
        const workflowDoc = await db.collection('workflows').doc(workflowId).get();
        const workflow = workflowDoc.data();

        await db.collection('workflows').doc(workflowId).update({
          currentAgent: phaseConfig.loopAgents[0],
          phaseIteration: (workflow?.phaseIteration || 1) + 1,
        });

        await addLog(workflowId, 'info', 'system', `🔄 수정 요청 - 아이디어 정교화 ${(workflow?.phaseIteration || 1) + 1}차 반복`);

        const agentContext = buildAgentContext(workflow);
        agentContext.researcher_feedback = feedback;
        await executeAgent(workflowId, phaseConfig.loopAgents[0], agentContext);
      } else {
        // 같은 에이전트 재실행
        await addLog(workflowId, 'info', agentId, `🔄 수정 요청 - 재작성`);
        const workflowDoc = await db.collection('workflows').doc(workflowId).get();
        const workflow = workflowDoc.data();
        const agentContext = buildAgentContext(workflow);
        agentContext.researcher_feedback = feedback;
        await executeAgent(workflowId, agentId, agentContext);
      }

    } else {
      // 거부 - 일시정지
      await db.collection('workflows').doc(workflowId).update({
        status: 'paused',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await addLog(workflowId, 'warn', agentId, `⏸️ 거부됨: ${feedback || '사유 없음'}`);
    }

    return { success: true };
  });

/**
 * 워크플로우 재시작
 */
export const restartWorkflow = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    const { workflowId, fromAgentId } = data;

    if (!workflowId) {
      throw new functions.https.HttpsError('invalid-argument', 'workflowId is required');
    }

    const workflowDoc = await db.collection('workflows').doc(workflowId).get();
    const workflow = workflowDoc.data();

    if (!workflow) {
      throw new functions.https.HttpsError('not-found', 'Workflow not found');
    }

    const agentId = fromAgentId || workflow.currentAgent;

    await db.collection('workflows').doc(workflowId).update({
      status: 'running',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await addLog(workflowId, 'info', 'system', `▶️ 워크플로우 재시작: ${agentId}부터`);

    const agentContext = buildAgentContext(workflow);
    await executeAgent(workflowId, agentId, agentContext);

    return { success: true };
  });

// ============================================
// 스케줄 기반 자동 영구 삭제
// ============================================

/**
 * 휴지통 자동 정리 (매일 새벽 3시 실행)
 * 30일이 지난 삭제된 워크플로우를 영구 삭제합니다.
 */
export const cleanupTrash = functions
  .region('asia-northeast3')
  .pubsub
  .schedule('0 3 * * *')  // 매일 새벽 3시 (Asia/Seoul 기준)
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    console.log('[Cleanup] Starting trash cleanup...');

    const now = admin.firestore.Timestamp.now();

    try {
      // permanentDeleteAt이 현재 시간보다 과거인 워크플로우 조회
      const snapshot = await db.collection('workflows')
        .where('permanentDeleteAt', '<=', now)
        .get();

      if (snapshot.empty) {
        console.log('[Cleanup] No workflows to delete.');
        return null;
      }

      console.log(`[Cleanup] Found ${snapshot.size} workflows to permanently delete.`);

      const batch = db.batch();
      const deletedIds: string[] = [];

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedIds.push(doc.id);
      });

      await batch.commit();

      console.log(`[Cleanup] Successfully deleted ${deletedIds.length} workflows:`, deletedIds);

      // 정리 로그 추가
      await db.collection('logs').add({
        level: 'info',
        agentId: 'system',
        message: `휴지통 자동 정리: ${deletedIds.length}개 워크플로우 영구 삭제`,
        details: { deletedIds },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return null;
    } catch (error) {
      console.error('[Cleanup] Error during trash cleanup:', error);

      await db.collection('logs').add({
        level: 'error',
        agentId: 'system',
        message: `휴지통 자동 정리 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return null;
    }
  });

/**
 * 수동 휴지통 정리 (HTTP Callable)
 * 관리자가 직접 호출하여 만료된 항목 삭제
 */
export const manualCleanupTrash = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    console.log('[Manual Cleanup] Starting manual trash cleanup...');

    const now = admin.firestore.Timestamp.now();

    try {
      const snapshot = await db.collection('workflows')
        .where('permanentDeleteAt', '<=', now)
        .get();

      if (snapshot.empty) {
        return { success: true, deleted: 0, message: '삭제할 항목이 없습니다.' };
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`[Manual Cleanup] Deleted ${snapshot.size} workflows.`);

      return {
        success: true,
        deleted: snapshot.size,
        message: `${snapshot.size}개의 만료된 워크플로우가 영구 삭제되었습니다.`,
      };
    } catch (error) {
      console.error('[Manual Cleanup] Error:', error);
      throw new functions.https.HttpsError(
        'internal',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  });
