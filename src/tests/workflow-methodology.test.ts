/**
 * 연구방법론별 워크플로우 분기 테스트
 * Workflow Selection by Methodology Test
 */

import { WorkflowEngine } from '../orchestration/WorkflowEngine.js';
import type { IStateManager } from '../core/interfaces/state.interface.js';
import type { ILogger } from '../core/interfaces/tool.interface.js';
import type { HITLInterface } from '../core/types/agent.types.js';

// Mock dependencies
const mockStateManager: IStateManager = {
  createSession: async () => ({
    sessionId: 'test-session',
    get: () => undefined,
    set: () => {},
    delete: () => false,
    has: () => false,
    clear: () => {},
    keys: () => [],
    entries: () => [],
    toJSON: () => ({}),
  }),
  getSession: async () => null,
  persist: async () => {},
  loadSession: async () => null,
  deleteSession: async () => false,
  listSessions: async () => [],
};

const mockAgentRegistry = {
  get: (id: string) => ({
    id,
    name: id,
    displayName: { en: id, ko: id },
    description: '',
    instruction: '',
    tools: [],
    skills: [],
    execute: async () => ({ success: true, output: {}, summary: '', metrics: { durationMs: 0, toolCalls: 0 }, requiresReview: false }),
    validateInput: () => ({ success: true, data: undefined }),
    canHandle: () => true,
  }),
  getAll: () => [],
};

const mockHitl: HITLInterface = {
  requestApproval: async () => ({ approved: true }),
  notifyStatus: async () => {},
  requestInput: async () => '',
};

const mockLogger: ILogger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  warn: (msg: string) => console.log(`[WARN] ${msg}`),
  error: (msg: string) => console.log(`[ERROR] ${msg}`),
  debug: (msg: string) => console.log(`[DEBUG] ${msg}`),
};

// 테스트 실행
function runTests() {
  const engine = new WorkflowEngine(mockStateManager, mockAgentRegistry, mockHitl, mockLogger);

  console.log('\n========================================');
  console.log('연구방법론별 워크플로우 분기 테스트');
  console.log('========================================\n');

  // 문헌 기반 연구방법론 전체 테스트
  console.log('📚 문헌 기반 연구방법론 (실험설계 생략)');
  console.log('----------------------------------------');

  const literatureBasedMethods = [
    { id: 'systematic-review', ko: '체계적 문헌고찰' },
    { id: 'meta-analysis', ko: '메타분석' },
    { id: 'scoping-review', ko: '주제범위 문헌고찰' },
    { id: 'narrative-review', ko: '서술적 문헌고찰' },
    { id: 'integrative-review', ko: '통합적 문헌고찰' },
    { id: 'rapid-review', ko: '신속 문헌고찰' },
    { id: 'umbrella-review', ko: '우산 문헌고찰' },
    { id: 'realist-review', ko: '실재론적 문헌고찰' },
    { id: 'critical-review', ko: '비판적 문헌고찰' },
    { id: 'qualitative-systematic-review', ko: '질적 체계적 문헌고찰' },
  ];

  let allLiteraturePass = true;
  for (const method of literatureBasedMethods) {
    const workflow = engine.getWorkflowForMethodology(method.id);
    const hasExpDesign = workflow.agents.some(a => 'id' in a && a.id === 'experiment-design');
    const pass = !hasExpDesign && workflow.id === 'literature-review';
    if (!pass) allLiteraturePass = false;
    console.log(`   ${pass ? '✅' : '❌'} ${method.ko} (${method.id}): ${workflow.agents.length}개 에이전트, 실험설계 ${hasExpDesign ? '포함❌' : '생략✓'}`);
  }
  console.log(`\n   📊 문헌 기반 연구 테스트: ${allLiteraturePass ? '✅ 전체 통과!' : '❌ 일부 실패'}`);
  console.log('');

  // 일반 연구방법론 테스트
  console.log('🔬 일반 연구방법론 (실험설계 포함)');
  console.log('----------------------------------------');

  const generalMethods = [
    { id: 'survey', ko: '설문조사', expected: 'quantitative-research' },
    { id: 'experimental', ko: '실험연구', expected: 'quantitative-research' },
    { id: 'grounded-theory', ko: '근거이론', expected: 'qualitative-research' },
    { id: 'phenomenology', ko: '현상학', expected: 'qualitative-research' },
    { id: 'case-study', ko: '사례연구', expected: 'qualitative-research' },
    { id: 'convergent-mixed', ko: '수렴적 혼합연구', expected: 'mixed-methods-research' },
    { id: 'explanatory-sequential', ko: '설명적 순차 혼합연구', expected: 'mixed-methods-research' },
  ];

  let allGeneralPass = true;
  for (const method of generalMethods) {
    const workflow = engine.getWorkflowForMethodology(method.id);
    const hasExpDesign = workflow.agents.some(a => 'id' in a && a.id === 'experiment-design');
    const pass = hasExpDesign && workflow.id === method.expected;
    if (!pass) allGeneralPass = false;
    console.log(`   ${pass ? '✅' : '❌'} ${method.ko} (${method.id}): ${workflow.id}, 실험설계 ${hasExpDesign ? '포함✓' : '생략❌'}`);
  }
  console.log(`\n   📊 일반 연구 테스트: ${allGeneralPass ? '✅ 전체 통과!' : '❌ 일부 실패'}`);
  console.log('');

  // 비교 요약 테이블
  console.log('========================================');
  console.log('📊 워크플로우 비교 요약');
  console.log('========================================\n');

  console.log('| 카테고리        | 워크플로우 ID           | 에이전트 | 실험설계 |');
  console.log('|-----------------|-------------------------|----------|----------|');
  console.log('| 문헌 기반 연구   | literature-review       | 5개      | ❌ 생략   |');
  console.log('| 양적 연구       | quantitative-research   | 6개      | ✅ 포함   |');
  console.log('| 질적 연구       | qualitative-research    | 6개      | ✅ 포함   |');
  console.log('| 혼합 연구       | mixed-methods-research  | 6개      | ✅ 포함   |');

  console.log('\n========================================');
  console.log('🎯 핵심 결과');
  console.log('========================================');
  console.log('');
  console.log('문헌 기반 연구 (10종):');
  console.log('  → 체계적/주제범위/서술적/통합적/신속/우산/실재론적/비판적/질적체계적 문헌고찰 + 메타분석');
  console.log('  → 모두 동일한 literature-review 워크플로우 사용');
  console.log('  → 실험설계(experiment-design) 단계 생략');
  console.log('  → 5개 에이전트: idea-building → literature-search → data-analysis → paper-writing → formatting-review');
  console.log('');
  console.log(`최종 결과: ${allLiteraturePass && allGeneralPass ? '✅ 모든 테스트 통과!' : '❌ 일부 테스트 실패'}`);
  console.log('');
}

runTests();
