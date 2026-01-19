/**
 * 연구방법론 기반 워크플로우 선택 서비스
 * Workflow Selector based on Research Methodology
 */

import type { MethodologyMetadata, ResearchApproach } from '../core/types/methodology.js';

export interface WorkflowConfig {
  id: string;
  name: string;
  type: 'sequential' | 'parallel' | 'hybrid';
  description: string;
  methodologyCategory: 'quantitative' | 'qualitative' | 'mixed';
  supportedMethods: string[];
}

/**
 * 사용 가능한 워크플로우 정의
 */
export const AVAILABLE_WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'quantitative-research',
    name: 'Quantitative Research Workflow',
    type: 'sequential',
    description: '설문조사, 실험연구, 상관연구 등 양적 연구방법론을 위한 워크플로우',
    methodologyCategory: 'quantitative',
    supportedMethods: [
      'survey-research',
      'experimental-research',
      'correlational-research',
      'quasi-experimental',
      'longitudinal-study',
      'meta-analysis'
    ]
  },
  {
    id: 'qualitative-research',
    name: 'Qualitative Research Workflow',
    type: 'sequential',
    description: '근거이론, 현상학, 사례연구 등 질적 연구방법론을 위한 워크플로우',
    methodologyCategory: 'qualitative',
    supportedMethods: [
      'grounded-theory',
      'phenomenology',
      'case-study',
      'ethnography',
      'narrative-research',
      'content-analysis'
    ]
  },
  {
    id: 'mixed-methods-research',
    name: 'Mixed Methods Research Workflow',
    type: 'hybrid',
    description: '순차적/동시적 혼합연구, 실행연구 등을 위한 워크플로우',
    methodologyCategory: 'mixed',
    supportedMethods: [
      'sequential-explanatory',
      'sequential-exploratory',
      'convergent-parallel',
      'embedded-design',
      'action-research',
      'delphi-method'
    ]
  }
];

export class WorkflowSelector {
  /**
   * 연구방법론에 따른 적합한 워크플로우 선택
   */
  selectWorkflow(methodology: MethodologyMetadata): WorkflowConfig {
    // 1. 방법론 ID로 직접 매칭 시도
    const directMatch = AVAILABLE_WORKFLOWS.find(
      wf => wf.supportedMethods.includes(methodology.id)
    );

    if (directMatch) {
      return directMatch;
    }

    // 2. 카테고리로 매칭
    const categoryMatch = AVAILABLE_WORKFLOWS.find(
      wf => wf.methodologyCategory === methodology.category
    );

    if (categoryMatch) {
      return categoryMatch;
    }

    // 3. 접근법으로 매칭
    return this.selectByApproach(methodology.approach);
  }

  /**
   * 연구 접근법에 따른 워크플로우 선택
   */
  selectByApproach(approach: ResearchApproach): WorkflowConfig {
    switch (approach) {
      case 'quantitative':
        return AVAILABLE_WORKFLOWS.find(wf => wf.id === 'quantitative-research')!;
      case 'qualitative':
        return AVAILABLE_WORKFLOWS.find(wf => wf.id === 'qualitative-research')!;
      case 'mixed-methods':
        return AVAILABLE_WORKFLOWS.find(wf => wf.id === 'mixed-methods-research')!;
      default:
        // 기본값: 양적 연구 워크플로우
        return AVAILABLE_WORKFLOWS.find(wf => wf.id === 'quantitative-research')!;
    }
  }

  /**
   * 모든 워크플로우 목록 반환
   */
  getAllWorkflows(): WorkflowConfig[] {
    return [...AVAILABLE_WORKFLOWS];
  }

  /**
   * ID로 워크플로우 조회
   */
  getWorkflowById(id: string): WorkflowConfig | undefined {
    return AVAILABLE_WORKFLOWS.find(wf => wf.id === id);
  }

  /**
   * 방법론과 워크플로우 호환성 확인
   */
  isCompatible(methodology: MethodologyMetadata, workflowId: string): boolean {
    const workflow = this.getWorkflowById(workflowId);
    if (!workflow) return false;

    // 직접 지원 여부
    if (workflow.supportedMethods.includes(methodology.id)) {
      return true;
    }

    // 카테고리 호환성
    if (workflow.methodologyCategory === methodology.category) {
      return true;
    }

    // 혼합 연구는 모든 방법론과 호환 가능
    if (workflow.id === 'mixed-methods-research') {
      return true;
    }

    return false;
  }

  /**
   * 방법론에 호환되는 모든 워크플로우 반환
   */
  getCompatibleWorkflows(methodology: MethodologyMetadata): WorkflowConfig[] {
    return AVAILABLE_WORKFLOWS.filter(wf => this.isCompatible(methodology, wf.id));
  }
}

// 싱글톤 인스턴스
export const workflowSelector = new WorkflowSelector();
