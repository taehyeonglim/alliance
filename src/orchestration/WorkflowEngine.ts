import { v4 as uuidv4 } from 'uuid';
import type { IAgent } from '../core/interfaces/agent.interface.js';
import type {
  IWorkflow,
  WorkflowContext,
  WorkflowResult,
} from '../core/interfaces/workflow.interface.js';
import type { ILogger } from '../core/interfaces/tool.interface.js';
import type { WorkflowDefinition, ExecutionOptions } from '../core/types/workflow.types.js';
import type { AgentResult, HITLInterface } from '../core/types/agent.types.js';
import type { IStateManager } from '../core/interfaces/state.interface.js';
import { SequentialWorkflow } from './workflows/SequentialWorkflow.js';
import { ParallelWorkflow } from './workflows/ParallelWorkflow.js';
import { LoopWorkflow } from './workflows/LoopWorkflow.js';

/**
 * Agent registry interface
 */
export interface IAgentRegistry {
  get(id: string): IAgent | undefined;
  getAll(): IAgent[];
}

/**
 * Main workflow orchestration engine
 * Supports hybrid workflows combining sequential, parallel, and loop patterns
 */
export class WorkflowEngine {
  private stateManager: IStateManager;
  private agentRegistry: IAgentRegistry;
  private hitl: HITLInterface;
  private logger: ILogger;
  private activeWorkflows: Map<string, IWorkflow> = new Map();

  constructor(
    stateManager: IStateManager,
    agentRegistry: IAgentRegistry,
    hitl: HITLInterface,
    logger: ILogger
  ) {
    this.stateManager = stateManager;
    this.agentRegistry = agentRegistry;
    this.hitl = hitl;
    this.logger = logger;
  }

  /**
   * Create and execute a workflow from configuration
   */
  async executeWorkflow(
    workflowConfig: WorkflowDefinition,
    input: unknown,
    options?: ExecutionOptions
  ): Promise<WorkflowResult> {
    const workflow = this.buildWorkflow(workflowConfig);
    const validation = workflow.validate();

    if (!validation.valid) {
      throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      for (const warning of validation.warnings) {
        this.logger.warn(`Workflow warning: ${warning}`);
      }
    }

    const context = await this.createContext(workflow, input, options);

    this.activeWorkflows.set(workflow.id, workflow);
    this.logger.info(`Starting workflow: ${workflow.name} (${workflow.id})`);

    try {
      const result = await workflow.execute(context);

      this.logger.info(
        `Workflow completed: ${workflow.name} - Success: ${result.success}`
      );

      return result;
    } finally {
      this.activeWorkflows.delete(workflow.id);
      await this.stateManager.persist(context.state.sessionId);
    }
  }

  /**
   * Build workflow from definition (supports hybrid/nested workflows)
   */
  private buildWorkflow(definition: WorkflowDefinition): IWorkflow {
    const agents = this.resolveAgents(definition);

    switch (definition.type) {
      case 'sequential':
        return new SequentialWorkflow(
          definition.id,
          definition.name,
          agents,
          definition.config
        );

      case 'parallel': {
        const mergerAgent = definition.mergerAgentId
          ? this.agentRegistry.get(definition.mergerAgentId)
          : undefined;
        return new ParallelWorkflow(
          definition.id,
          definition.name,
          agents,
          definition.config,
          mergerAgent
        );
      }

      case 'loop':
        return new LoopWorkflow(
          definition.id,
          definition.name,
          agents,
          definition.config
        );

      case 'hybrid':
        // Hybrid workflows use sequential as base with nested workflows
        return new SequentialWorkflow(
          definition.id,
          definition.name,
          agents,
          definition.config
        );

      default:
        throw new Error(`Unknown workflow type: ${definition.type}`);
    }
  }

  /**
   * Resolve agent references to actual agents
   */
  private resolveAgents(definition: WorkflowDefinition): IAgent[] {
    return definition.agents.map((agentDef) => {
      // Handle nested workflow definitions
      if ('workflow' in agentDef) {
        // Create a workflow agent wrapper
        const nestedWorkflow = this.buildWorkflow(agentDef.workflow);
        return this.createWorkflowAgentWrapper(nestedWorkflow);
      }

      // Regular agent reference
      const agent = this.agentRegistry.get(agentDef.id);
      if (!agent) {
        throw new Error(`Agent not found: ${agentDef.id}`);
      }
      return agent;
    });
  }

  /**
   * Create a wrapper agent for nested workflows
   */
  private createWorkflowAgentWrapper(workflow: IWorkflow): IAgent {
    return {
      id: workflow.id,
      name: workflow.name,
      displayName: { en: workflow.name, ko: workflow.name },
      description: `Nested workflow: ${workflow.name}`,
      instruction: '',
      tools: [],
      skills: [],
      outputKey: undefined,
      model: undefined,

      async execute(context) {
        const workflowContext: WorkflowContext = {
          ...context,
          workflowConfig: {
            continueOnError: false,
            approvalGates: [],
          },
          previousResults: new Map<string, AgentResult>(),
          branchResults: new Map<string, AgentResult>(),
        };

        const result = await workflow.execute(workflowContext);

        return {
          success: result.success,
          output: result.output,
          summary: `Workflow ${workflow.name} completed`,
          metrics: {
            durationMs: result.metrics.totalDurationMs,
            toolCalls: 0,
          },
          requiresReview: false,
        };
      },

      validateInput: () => ({ success: true, data: undefined }),
      canHandle: () => true,
    };
  }

  /**
   * Create execution context
   */
  private async createContext(
    _workflow: IWorkflow,
    input: unknown,
    options?: ExecutionOptions
  ): Promise<WorkflowContext> {
    const session = await this.stateManager.createSession(options?.sessionId);

    const abortController = options?.abortController ?? new AbortController();

    return {
      state: session,
      invocation: {
        invocationId: uuidv4(),
        input,
        timeout: options?.timeout,
        actions: {
          escalate: false,
          requestIntervention: false,
        },
      },
      signal: abortController.signal,
      logger: this.logger,
      hitl: this.hitl,
      workflowConfig: {
        continueOnError: false,
        approvalGates: [],
      },
      previousResults: new Map(),
      branchResults: new Map(),
    };
  }

  /**
   * Get default research workflow definition
   */
  getDefaultResearchWorkflow(): WorkflowDefinition {
    return {
      id: 'default-research',
      name: 'Default Research Workflow',
      type: 'sequential',
      agents: [
        { id: 'idea-building' },
        { id: 'literature-search' },
        { id: 'experiment-design' },
        { id: 'data-analysis' },
        { id: 'paper-writing' },
        { id: 'formatting-review' },
      ],
      config: {
        continueOnError: false,
        approvalGates: ['experiment-design', 'paper-writing', 'formatting-review'],
      },
    };
  }

  /**
   * Get workflow definition based on methodology
   * 연구방법론에 따른 워크플로우 정의 반환
   */
  getWorkflowForMethodology(methodologyId: string): WorkflowDefinition {
    // 문헌 기반 연구방법론 목록 (실험설계 불필요)
    const literatureBasedMethods = [
      // 체계적/양적 문헌고찰
      'systematic-review',
      'meta-analysis',
      'rapid-review',
      'umbrella-review',
      // 질적 문헌고찰
      'scoping-review',
      'narrative-review',
      'realist-review',
      'critical-review',
      'qualitative-systematic-review',
      // 통합적 문헌고찰
      'integrative-review',
    ];

    // 문헌 기반 연구는 모두 문헌고찰 워크플로우 사용
    if (literatureBasedMethods.includes(methodologyId)) {
      this.logger.info(`Literature-based methodology '${methodologyId}' → Literature Review Workflow`);
      return this.getLiteratureReviewWorkflow(methodologyId);
    }

    // 방법론별 워크플로우 매핑
    const workflowMap: Record<string, WorkflowDefinition> = {
      // 양적 연구 (실험/조사 기반)
      'survey': this.getQuantitativeWorkflow(),
      'survey-research': this.getQuantitativeWorkflow(),
      'experimental': this.getQuantitativeWorkflow(),
      'experimental-research': this.getQuantitativeWorkflow(),
      'correlational': this.getQuantitativeWorkflow(),
      'correlational-research': this.getQuantitativeWorkflow(),
      'quasi-experimental': this.getQuantitativeWorkflow(),
      'longitudinal': this.getQuantitativeWorkflow(),
      'longitudinal-study': this.getQuantitativeWorkflow(),

      // 질적 연구 (현장/인터뷰 기반)
      'grounded-theory': this.getQualitativeWorkflow(),
      'phenomenology': this.getQualitativeWorkflow(),
      'case-study': this.getQualitativeWorkflow(),
      'ethnography': this.getQualitativeWorkflow(),
      'narrative': this.getQualitativeWorkflow(),
      'narrative-research': this.getQualitativeWorkflow(),
      'action-research': this.getQualitativeWorkflow(),
      'content-analysis': this.getQualitativeWorkflow(),

      // 혼합 연구
      'convergent-mixed': this.getMixedMethodsWorkflow(),
      'explanatory-sequential': this.getMixedMethodsWorkflow(),
      'exploratory-sequential': this.getMixedMethodsWorkflow(),
      'sequential-explanatory': this.getMixedMethodsWorkflow(),
      'sequential-exploratory': this.getMixedMethodsWorkflow(),
      'convergent-parallel': this.getMixedMethodsWorkflow(),
      'embedded-design': this.getMixedMethodsWorkflow(),
      'delphi-method': this.getMixedMethodsWorkflow(),
    };

    const workflow = workflowMap[methodologyId];
    if (workflow) {
      this.logger.info(`Selected workflow for methodology '${methodologyId}': ${workflow.id}`);
      return workflow;
    }

    this.logger.warn(`No specific workflow for methodology '${methodologyId}', using default`);
    return this.getDefaultResearchWorkflow();
  }

  /**
   * Literature Review Workflow (문헌고찰 전용 워크플로우)
   * 체계적 문헌고찰, 주제범위 문헌고찰, 메타분석 등 모든 문헌 기반 연구에 사용
   * 핵심: 실험설계(experiment-design) 단계를 건너뜀
   */
  private getLiteratureReviewWorkflow(methodologyId: string): WorkflowDefinition {
    // 방법론별 특수 설정
    const methodologyConfig: Record<string, {
      name: string;
      prismaCompliance: boolean;
      qualityAssessment: boolean;
      metaAnalysis: boolean;
    }> = {
      'systematic-review': {
        name: '체계적 문헌고찰',
        prismaCompliance: true,
        qualityAssessment: true,
        metaAnalysis: false,
      },
      'meta-analysis': {
        name: '메타분석',
        prismaCompliance: true,
        qualityAssessment: true,
        metaAnalysis: true,
      },
      'scoping-review': {
        name: '주제범위 문헌고찰',
        prismaCompliance: true, // PRISMA-ScR 사용
        qualityAssessment: false, // 품질 평가 선택적
        metaAnalysis: false,
      },
      'narrative-review': {
        name: '서술적 문헌고찰',
        prismaCompliance: false,
        qualityAssessment: false,
        metaAnalysis: false,
      },
      'integrative-review': {
        name: '통합적 문헌고찰',
        prismaCompliance: false,
        qualityAssessment: true,
        metaAnalysis: false,
      },
      'rapid-review': {
        name: '신속 문헌고찰',
        prismaCompliance: true, // 간소화된 PRISMA
        qualityAssessment: true, // 간소화
        metaAnalysis: false,
      },
      'umbrella-review': {
        name: '우산 문헌고찰',
        prismaCompliance: true,
        qualityAssessment: true, // AMSTAR2
        metaAnalysis: true,
      },
      'realist-review': {
        name: '실재론적 문헌고찰',
        prismaCompliance: false, // RAMESES 사용
        qualityAssessment: true,
        metaAnalysis: false,
      },
      'critical-review': {
        name: '비판적 문헌고찰',
        prismaCompliance: false,
        qualityAssessment: false,
        metaAnalysis: false,
      },
      'qualitative-systematic-review': {
        name: '질적 체계적 문헌고찰',
        prismaCompliance: true, // ENTREQ 사용
        qualityAssessment: true, // CASP 등
        metaAnalysis: false, // 대신 메타합성
      },
    };

    const config = methodologyConfig[methodologyId] || {
      name: '문헌고찰',
      prismaCompliance: false,
      qualityAssessment: true,
      metaAnalysis: false,
    };

    return {
      id: 'literature-review',
      name: `Literature Review Workflow (${config.name})`,
      type: 'sequential',
      agents: [
        { id: 'idea-building' },      // 연구질문/프로토콜 수립
        { id: 'literature-search' },   // 체계적 문헌 검색 (핵심!)
        // ⚠️ 실험설계(experiment-design) 생략 - 문헌고찰에서는 불필요
        { id: 'data-analysis' },       // 문헌 분석/질 평가/합성
        { id: 'paper-writing' },       // 논문 작성
        { id: 'formatting-review' },   // 최종 검토
      ],
      config: {
        continueOnError: false,
        approvalGates: [
          'idea-building',      // 프로토콜/연구질문 승인
          'literature-search',  // 검색 전략 및 결과 승인
          'data-analysis',      // 문헌 분석 결과 승인
          'paper-writing',
          'formatting-review',
        ],
        methodologySpecific: {
          type: 'literature-review',
          subtype: methodologyId,
          ...config,
          // 문헌고찰 공통 특징
          skippedAgents: ['experiment-design'],
          focusOnLiteratureSearch: true,
        },
      },
    };
  }

  /**
   * Quantitative Research Workflow
   * 양적 연구 워크플로우
   */
  private getQuantitativeWorkflow(): WorkflowDefinition {
    return {
      id: 'quantitative-research',
      name: 'Quantitative Research Workflow',
      type: 'sequential',
      agents: [
        { id: 'idea-building' },
        { id: 'literature-search' },
        { id: 'experiment-design' },
        { id: 'data-analysis' },
        { id: 'paper-writing' },
        { id: 'formatting-review' },
      ],
      config: {
        continueOnError: false,
        approvalGates: ['experiment-design', 'paper-writing', 'formatting-review'],
        methodologySpecific: {
          type: 'quantitative',
          statisticalAnalysis: true,
        },
      },
    };
  }

  /**
   * Qualitative Research Workflow
   * 질적 연구 워크플로우
   */
  private getQualitativeWorkflow(): WorkflowDefinition {
    return {
      id: 'qualitative-research',
      name: 'Qualitative Research Workflow',
      type: 'sequential',
      agents: [
        { id: 'idea-building' },
        { id: 'literature-search' },
        { id: 'experiment-design' },  // 질적 연구 설계
        { id: 'data-analysis' },       // 질적 분석 (코딩, 주제분석 등)
        { id: 'paper-writing' },
        { id: 'formatting-review' },
      ],
      config: {
        continueOnError: false,
        approvalGates: ['experiment-design', 'paper-writing', 'formatting-review'],
        methodologySpecific: {
          type: 'qualitative',
          iterativeAnalysis: true,
          trustworthiness: ['credibility', 'transferability', 'dependability', 'confirmability'],
        },
      },
    };
  }

  /**
   * Mixed Methods Research Workflow
   * 혼합 연구 워크플로우
   */
  private getMixedMethodsWorkflow(): WorkflowDefinition {
    return {
      id: 'mixed-methods-research',
      name: 'Mixed Methods Research Workflow',
      type: 'hybrid',
      agents: [
        { id: 'idea-building' },
        { id: 'literature-search' },
        { id: 'experiment-design' },
        { id: 'data-analysis' },  // 양적+질적 통합 분석
        { id: 'paper-writing' },
        { id: 'formatting-review' },
      ],
      config: {
        continueOnError: false,
        approvalGates: ['experiment-design', 'data-analysis', 'paper-writing', 'formatting-review'],
        methodologySpecific: {
          type: 'mixed-methods',
          integrationPoint: 'data-analysis',
        },
      },
    };
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): IWorkflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Cancel a running workflow
   */
  cancelWorkflow(workflowId: string): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow) {
      this.logger.info(`Cancelling workflow: ${workflowId}`);
      // Cancellation is handled via AbortController in context
      return true;
    }
    return false;
  }
}
